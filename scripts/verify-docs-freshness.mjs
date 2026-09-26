/*
 * Keeps prose from restating facts the tree or a generator owns. Findings:
 *   stale-term, dead-script, dead-path  retired vocabulary, uncited `npm run` scripts, missing files
 *   published-doc    a shipped doc (package.json#files) links to a missing or unshipped file,
 *                    imports through the checkout's `@/components` alias, or states another version
 *   two-owners       a generated file written by a script other than its listed owner
 *   stale-generated  committed output differs from its generator. Generators RUN here, so a failure
 *                    leaves corrected files on disk: commit them.
 * Digits in prose are allowed; restating a generator-owned catalogue is not.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, normalize } from 'node:path'
import { declaredTokens } from './lib/token-surface.mjs'

/* Generated reference is checked by regeneration below, not as prose. */
const ARCHIVED = ['docs/generated']

/*
 * The repository's documents: tracked files and new ones git would pick up, never a local
 * file git ignores, so a checkout checks what a fresh clone checks.
 */
const inRepository = new Set(
  execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean),
)

function markdownUnder(dir) {
  if (ARCHIVED.includes(dir) || !existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? markdownUnder(`${dir}/${entry.name}`)
      : entry.name.endsWith('.md') && inRepository.has(`${dir}/${entry.name}`)
        ? [`${dir}/${entry.name}`]
        : [],
  )
}

const DOCS = [
  'README.md',
  ...markdownUnder('docs'),
  ...markdownUnder('src/styles'),
  /* The shipped assistant skill too: a coding assistant takes a stale SKILL.md as instructions. */
  ...markdownUnder('.agents/skills/themelia-ui'),
  'tests/README.md',
]

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const scripts = new Set(Object.keys(pkg.scripts))
const declared = new Set(declaredTokens())
const failures = []

/* A term is stale once the thing it names is gone from the tree, so retiring it retires the word. */
const STALE_TERMS = [
  { term: 'components/blocks', gone: () => !existsSync('src/components/blocks') },
  { term: 'blocks/', gone: () => !existsSync('src/components/blocks') },
  { term: 'composed/', gone: () => !existsSync('src/components/composed') },
  { term: 'npm run check:layers', gone: () => !scripts.has('check:layers') },
  /* Every custom property the codemod renames or removes, once the source no longer declares it. */
  ...Object.keys(JSON.parse(readFileSync('docs/generated/migration-codemod.json', 'utf8')).tokens).map((token) => ({
    term: token,
    pattern: new RegExp(`${token.replace(/[-]/g, '\\-')}(?![A-Za-z0-9-])`),
    gone: () => !declared.has(token),
  })),
]

for (const doc of DOCS) {
  if (!existsSync(doc)) continue
  const text = readFileSync(doc, 'utf8')
  const lines = text.split('\n')

  /* A doc marked **Historical.** in its opening lines already warns the reader; it is exempt. */
  if (/\*\*Historical\.\*\*/.test(lines.slice(0, 30).join('\n'))) continue

  /* A migration guide is where every old name SHOULD appear. */
  const isMigrationGuide = /(^|\/)migration\.md$/.test(doc)

  for (const { term, pattern, gone } of STALE_TERMS) {
    if (!gone()) continue
    if (pattern && isMigrationGuide) continue
    lines.forEach((line, index) => {
      const names = pattern ? pattern.test(line) : line.includes(term)
      /* Quoted `>` lines and lines phrased as a rename or removal are history, not references. */
      if (names && !/^\s*>/.test(line) && !/was|→|removed|used to|no longer|renamed|split/i.test(line)) {
        failures.push(`stale-term      ${doc}:${index + 1}  names "${term}", which no longer exists`)
      }
    })
  }

  for (const match of text.matchAll(/`npm run ([\w:-]+)`/g)) {
    if (!scripts.has(match[1])) {
      failures.push(`dead-script     ${doc}  cites \`npm run ${match[1]}\`, which is not a script`)
    }
  }

  /*
   * dead-path: resolved against several bases because docs write paths relatively
   * (`theming/colors.css` is `src/styles/theming/colors.css`). Package subpaths, aliases, URLs
   * and `examples/` (standalone apps that cite their own layout) are skipped.
   */
  const BASES = ['', 'src/', 'src/styles/', 'scripts/', 'docs/']
  for (const match of text.matchAll(/`([\w./-]*\/[\w./-]+\.(?:ts|tsx|mjs|js|json|css|md|ya?ml))`/g)) {
    const cited = match[1]
    if (/^(themelia-ui|@\/|node_modules|https?:|dist\/|examples\/)/.test(cited)) continue

    /*
     * Correctly absent: a path the reader is told to create, or one described as removed.
     * Judged on a three-line window because prose wraps the qualifier onto the next line.
     */
    const at = text.slice(0, match.index).split('\n').length - 1
    const sentence = lines.slice(Math.max(0, at - 1), at + 2).join(' ')
    if (/\b(write|create|add|touch|scaffold|generate)\b/i.test(sentence)) continue
    if (/\bwas\b|→|removed|used to|no longer|renamed|split|deleted/i.test(sentence)) continue
    /* Relative to the document's own folder, e.g. a skill citing `references/imports.md`. */
    const local = `${doc.split('/').slice(0, -1).join('/')}/${cited}`
    if (existsSync(local)) continue
    if (BASES.some((base) => existsSync(base + cited))) continue
    failures.push(`dead-path       ${doc}  cites \`${cited}\`, which is not a file`)
  }
}

/*
 * What the tarball ships is read by consumers who have no checkout: every relative link must
 * land on a file that is also shipped, no example may import through `@/components`, and the
 * migration guide's hand-written version must be this one.
 */
{
  const shippedRoots = (pkg.files ?? []).filter((entry) => entry !== 'dist')
  const shipped = (target) => shippedRoots.some((entry) => target === entry || target.startsWith(`${entry.replace(/\/$/, '')}/`))
  const walk = (path) => (!existsSync(path) ? [] : statSync(path).isDirectory() ? readdirSync(path).flatMap((name) => walk(join(path, name))) : [path])
  for (const doc of shippedRoots.flatMap(walk).filter((file) => file.endsWith('.md'))) {
    const text = readFileSync(doc, 'utf8')
    for (const [, raw] of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      if (/^(https?:|mailto:|#)/.test(raw)) continue
      const target = normalize(join(dirname(doc), decodeURIComponent(raw.split('#')[0])))
      if (target.startsWith('..') || !existsSync(target)) failures.push(`published-doc   ${doc}  links to ${raw}, which is not a file`)
      else if (!shipped(target)) failures.push(`published-doc   ${doc}  links to ${raw}, which package.json#files does not ship`)
    }
    for (const [, specifier] of text.matchAll(/(?:from\s+|import\s*)["'](@\/components\/[^"']+|src\/components\/[^"']+)["']/g)) {
      failures.push(`published-doc   ${doc}  imports ${specifier}, which only resolves in this checkout`)
    }
  }
  const stated = readFileSync('docs/learn/migration.md', 'utf8').match(/package is `([^`]+)`/)?.[1]
  if (stated !== pkg.version) failures.push(`published-doc   docs/learn/migration.md  says the package is ${stated}; package.json says ${pkg.version}`)
}

/*
 * A generated file that no longer matches its generator. Docs read the API snapshot and
 * dist/, so `scripts/verify.mjs` runs this after the build and `api-snapshot`.
 */
const GENERATED = [
  { file: 'docs/generated/composition-ladder.md', by: 'scripts/gen-composition-ladder.mjs' },
  { file: 'docs/generated/imports.md', by: 'scripts/gen-consumer-docs.mjs' },
  { file: 'docs/generated/public-api.md', by: 'scripts/gen-consumer-docs.mjs' },
  { file: 'docs/generated/profiles.md', by: 'scripts/gen-consumer-docs.mjs' },
  { file: 'docs/generated/component-index.json', by: 'scripts/gen-consumer-docs.mjs' },
  { file: 'src/preview/generated/gallery.json', by: 'scripts/gen-gallery.mjs' },
  { file: 'docs/generated/components/INDEX.md', by: 'scripts/gen-consumer-docs.mjs' },
  { file: 'docs/generated/migration-broad-imports.md', by: 'scripts/gen-migration-map.mjs' },
  { file: 'docs/generated/migration.md', by: 'scripts/gen-migration-map.mjs' },
  { file: 'tests/README.md', by: 'scripts/gen-test-docs.mjs' },
  { file: 'src/styles/tailwind.css', by: 'scripts/gen-tailwind-bridge.mjs' },
  { file: 'docs/build/recipes.md', by: 'scripts/gen-consumer-docs.mjs' },
  { file: 'docs/generated/recipes.json', by: 'scripts/gen-consumer-docs.mjs' },
  /* The assistant skill ships in the tarball. */
  { file: '.agents/skills/themelia-ui/SKILL.md', by: 'scripts/gen-agent-skill.mjs' },
  { file: '.agents/skills/themelia-ui/references/imports.md', by: 'scripts/gen-agent-skill.mjs' },
  { file: '.agents/skills/themelia-ui/references/components/INDEX.json', by: 'scripts/gen-agent-skill.mjs' },
  /*
   * The generator rewrites only README's status block between its markers and copies the rest
   * through, so a whole-file comparison checks exactly the part it owns.
   */
  { file: 'README.md', by: 'scripts/gen-status-docs.mjs' },
]

/* Per-family references are dynamic because the manifest owns the family set. */
if (existsSync('docs/generated/components')) {
  for (const name of readdirSync('docs/generated/components').filter((name) => name.endsWith('.md'))) {
    const doc = `components/${name}`
    if (name !== 'INDEX.md') {
      GENERATED.push({ file: `docs/generated/${doc}`, by: 'scripts/gen-consumer-docs.mjs' })
    }
    GENERATED.push({ file: `.agents/skills/themelia-ui/references/${doc}`, by: 'scripts/gen-agent-skill.mjs' })
  }
}
// Every shipped guide is checked, not only the index and imports table.
{
  const directory = '.agents/skills/themelia-ui/references'
  for (const name of readdirSync(directory).filter((name) => name.endsWith('.md'))) {
    const file = `${directory}/${name}`
    if (!GENERATED.some((entry) => entry.file === file)) GENERATED.push({ file, by: 'scripts/gen-agent-skill.mjs' })
  }
}
/*
 * ── One file, one generator ──
 * Two writers make a file depend on run order and this gate flap. The table above names the
 * owner; no other script may write that path.
 */
{
  const owners = new Map(GENERATED.map(({ file, by }) => [file, by]))

  for (const name of readdirSync('scripts')) {
    if (!name.endsWith('.mjs')) continue
    const script = `scripts/${name}`
    const source = readFileSync(script, 'utf8')

    /*
     * The FIRST argument only (a later one may be a path the script merely reads), resolved
     * through a one-hop `const` so a variable target is still seen.
     */
    const constants = new Map()
    for (const [, name, value] of source.matchAll(/const\s+(\w+)\s*=\s*['"`]([^'"`]+)['"`]/g)) {
      constants.set(name, value)
    }

    const writeTargets = []
    let at = source.indexOf('writeFileSync(')
    while (at !== -1) {
      const open = at + 'writeFileSync('.length
      const comma = source.indexOf(',', open)
      const argument = source.slice(open, comma === -1 ? open + 120 : comma).trim()
      /* Unquoted so the match below is equality; a substring test would read a
       * write to `tests/README.md` as a write to `README.md`. */
      const resolved = constants.get(argument) ?? argument
      writeTargets.push(resolved.replace(/^['"`]|['"`]$/g, ''))
      at = source.indexOf('writeFileSync(', at + 1)
    }

    for (const [file, owner] of owners) {
      if (script === owner) continue
      /* An unresolvable dynamic target is a miss, which beats blaming the wrong generator. */
      if (!writeTargets.includes(file)) continue
      failures.push(
        `two-owners      ${file} is written by ${script} as well as by ${owner} — ` +
          'whichever runs last wins, so the file depends on run order',
      )
    }
  }
}

const before = new Map(GENERATED.map(({ file }) => [file, existsSync(file) ? readFileSync(file, 'utf8') : null]))

/* A generator that throws leaves its old output on disk, so its exit code is the verdict. */
for (const generator of [...new Set(GENERATED.map((g) => g.by))]) {
  try {
    execFileSync('node', [generator], { stdio: 'ignore' })
  } catch (error) {
    /* Print the static findings first: one of them (e.g. two-owners) is often the crash's cause. */
    if (failures.length) {
      console.log(`${failures.length} problem(s) found before the generators ran:\n`)
      for (const line of [...new Set(failures)].sort()) console.log(`  ${line}`)
      console.log('')
    }
    console.error(`FAIL verify docs-freshness — ${generator} exited ${error.status}`)
    process.exit(1)
  }
}

for (const { file, by } of GENERATED) {
  if (!existsSync(file)) {
    failures.push(`stale-generated ${file} is missing — run \`node ${by}\``)
    continue
  }
  if (before.get(file) !== readFileSync(file, 'utf8')) {
    failures.push(`stale-generated ${file} differs from what ${by} produces — commit the regenerated file`)
  }
}

if (failures.length) {
  console.log(`FAIL verify docs-freshness — ${failures.length} problem(s)\n`)
  for (const line of [...new Set(failures)].sort()) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify docs-freshness — ${DOCS.length} documents carry no retired vocabulary, no dead path, ` +
    `no dead script, and ${GENERATED.length} generated files match their generators.`,
)
