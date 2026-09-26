/*
 * Diffs architecture/api-snapshot.json against the declarations the build publishes and
 * classifies each change: a removed name or subpath is BREAKING; a changed signature is
 * BREAKING, additive or needs review (see classify); an added name or subpath is additive.
 * Every change fails, additions included, so the snapshot stays evidence for removals.
 * `--update` accepts them, but refuses a BREAKING change no migration entry names.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const PATH = 'architecture/api-snapshot.json'

/* A removed name needs guidance where a consumer will look: migrations or the broad-import map. */
const migrations = JSON.parse(readFileSync('architecture/migrations.json', 'utf8'))
const broadMap = JSON.parse(readFileSync('docs/generated/migration-broad-imports.json', 'utf8'))
const guidanceText = [
  JSON.stringify(migrations),
  Object.keys(broadMap.symbols ?? {}).join(' '),
].join(' ')
const hasGuidance = (name) => guidanceText.includes(name)

/*
 * The broad-import map lists every published symbol, so it would vouch for any changed
 * declaration; a change needs a recorded migration.
 */
const migrationsText = JSON.stringify(migrations)
const hasChangeGuidance = (name) => migrationsText.includes(name)

const committed = JSON.parse(readFileSync(PATH, 'utf8')).entrypoints
const before = readFileSync(PATH, 'utf8')
execFileSync('node', ['scripts/gen-api-snapshot.mjs'], { stdio: 'ignore' })
const current = JSON.parse(readFileSync(PATH, 'utf8')).entrypoints

/*
 * `interface` and `type` are interchangeable for an object shape. `value` is what the
 * generator records when it cannot see behind a re-export, so it matches any kind.
 */
const sameKind = (a, b) => {
  if (a === b) return true
  const isType = (kind) => kind === 'type' || kind === 'interface'
  if (isType(a) && isType(b)) return true
  return a === 'value' || b === 'value'
}

/**
 * How one declaration changed for a consumer, or `null` when nothing that matters did:
 * reordered members and reflowed types are normalised away by the generator.
 */
function classify(was, now) {
  if (!sameKind(was.kind, now.kind)) {
    /* A kind change with the same call signature (function → const) breaks nobody. */
    if (was.signature && was.signature === now.signature) return null
    return { level: 'BREAKING', what: `${was.kind} → ${now.kind}` }
  }

  if (JSON.stringify(was.extends ?? []) !== JSON.stringify(now.extends ?? [])) {
    return {
      level: 'BREAKING',
      what: `inherited contract: ${(was.extends ?? []).join(', ') || 'none'} → ${(now.extends ?? []).join(', ') || 'none'}`,
    }
  }

  /* Compare members only when both records have them: no members is missing detail, not {}. */
  if (was.members && now.members) {
    const wasMembers = was.members
    const nowMembers = now.members
    const broken = []
    const additive = []

    for (const [name, member] of Object.entries(wasMembers)) {
      const next = nowMembers[name]
      if (!next) {
        broken.push(`${name} removed`)
        continue
      }
      /* Optional → required breaks everyone who omitted it. The reverse breaks nobody. */
      if (!member.optional && next.optional) additive.push(`${name} became optional`)
      else if (member.optional && !next.optional) broken.push(`${name} became required`)
      if (member.type !== next.type) broken.push(`${name}: ${member.type} → ${next.type}`)
    }

    for (const [name, member] of Object.entries(nowMembers)) {
      if (wasMembers[name]) continue
      /* A new REQUIRED member is a break for anyone constructing the object themselves. */
      if (member.optional) additive.push(`${name} added`)
      else broken.push(`${name} added as required`)
    }

    if (broken.length > 0) return { level: 'BREAKING', what: broken.slice(0, 3).join('; ') }
    if (additive.length > 0) return { level: 'additive', what: additive.slice(0, 3).join('; ') }
    return null
  }

  if (was.signature !== now.signature) {
    /* Widening a parameter or returning a supertype is compatible; telling which needs a person. */
    return { level: 'review', what: `${was.signature ?? '?'} → ${now.signature ?? '?'}` }
  }

  return null
}

const failures = []
const unguided = []

for (const subpath of Object.keys(committed).sort()) {
  if (!current[subpath]) {
    failures.push(`gone-entry  ${subpath} is no longer published — BREAKING`)
    continue
  }
  for (const [name, was] of Object.entries(committed[subpath]).sort()) {
    const now = current[subpath][name]
    if (now === undefined) {
      const guided = hasGuidance(name)
      failures.push(
        `removed     ${subpath}  ${name} (${was.kind}) — BREAKING` +
          (guided ? '' : ', and NO migration guidance names it'),
      )
      if (!guided) unguided.push(name)
      continue
    }
    const change = classify(was, now)
    if (change) {
      const guided = change.level !== 'BREAKING' || hasChangeGuidance(name)
      failures.push(
        `changed     ${subpath}  ${name}: ${change.what} — ${change.level}` +
          (guided ? '' : ', and NO migration guidance names it'),
      )
      /* A breaking change needs guidance before `--update` accepts it, as a removal does. */
      if (!guided) unguided.push(name)
    }
  }
}

for (const subpath of Object.keys(current).sort()) {
  if (!committed[subpath]) {
    failures.push(`new-entry   ${subpath} is published and not in the snapshot — additive`)
    continue
  }
  for (const name of Object.keys(current[subpath]).sort()) {
    if (committed[subpath][name] === undefined) {
      failures.push(`added       ${subpath}  ${name} — additive`)
    }
  }
}

/* Leave the committed file as it was unless the change is accepted deliberately. */
if (!process.argv.includes('--update')) writeBack(before)

function writeBack(text) {
  // In-process: a snapshot can exceed the OS command-line limit (api-exports.test.mjs).
  writeFileSync(PATH, text)
}

if (process.argv.includes('--update')) {
  if (unguided.length) {
    console.log(
      `FAIL verify api-snapshot — ${unguided.length} breaking change(s) have no migration ` +
        'guidance, so --update is refused\n',
    )
    for (const name of unguided.sort()) console.log(`  ${name}`)
    console.log(
      '\n  Add an entry to architecture/migrations.json naming it and what replaces it,' +
        '\n  then run --update again.',
    )
    /* gen-api-snapshot already overwrote the file; a refused update must leave nothing to commit. */
    writeBack(before)
    process.exit(1)
  }
  console.log(`api snapshot updated — ${failures.length} change(s) accepted`)
  process.exit(0)
}

const total = Object.values(current).reduce((n, e) => n + Object.keys(e).length, 0)
if (failures.length) {
  const breaking = failures.filter((f) => f.includes('BREAKING')).length
  console.log(
    `FAIL verify api-snapshot — ${failures.length} change(s), ${breaking} breaking\n`,
  )
  for (const line of failures.slice(0, 40)) console.log(`  ${line}`)
  if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`)
  console.log(
    '\n  `node scripts/verify-api-snapshot.mjs --update` accepts them into the snapshot.' +
      '\n  A BREAKING line needs a migration entry and a named phase before it is accepted.',
  )
  process.exit(1)
}
console.log(
  `PASS verify api-snapshot — ${Object.keys(current).length} entrypoints, ${total} declarations, ` +
    'none removed or changed kind.',
)
