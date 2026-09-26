/*
 * Gate: gzip CSS bytes a representative consumer ships, per recipe and for the whole
 * catalogue, against architecture/css-budgets.json. Recipes follow the dist/ `@import`
 * graph as a bundler would, counting each sheet once. Needs a built dist/.
 * Fails when a recipe is over budget, the catalogue exceeds its hard ceiling, a recipe
 * names a family with no stylesheet, or a shipped sheet holds syntax the build rewrote.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

/*
 * The catalogue has two numbers: `target` (the fixture budget today) and `hard` (the
 * architectural maximum), kept apart so the target cannot quietly become the ceiling.
 */
export const BUDGETS = JSON.parse(readFileSync('architecture/css-budgets.json', 'utf8'))

export const FIXTURES = [
  ...BUDGETS.recipes,
  {
    name: 'Complete catalogue stylesheet',
    budgetKb: Math.round(BUDGETS.catalogue.targetGzipBytes / 1024),
    budgetBytes: BUDGETS.catalogue.targetGzipBytes,
    sheet: BUDGETS.catalogue.sheet,
  },
]

/**
 * Follow @import, once per file. With `strict`, a missing entry throws (a recipe must not
 * measure a family that ships nothing); missing files reached BY an @import are skipped.
 */
export function collect(entry, seen = new Set(), strict = false) {
  const path = resolve(entry)
  if (!existsSync(path)) {
    if (strict) throw new Error(`missing CSS entrypoint: ${entry}`)
    return seen
  }
  if (seen.has(path)) return seen
  seen.add(path)
  for (const match of readFileSync(path, 'utf8').matchAll(/@import\s+["']([^"']+)["']/g)) {
    collect(resolve(dirname(path), match[1]), seen)
  }
  return seen
}

/** The stylesheets one fixture pulls in; throws when a named family has no stylesheet. */
export function resolveFixture(fixture, dist = 'dist') {
  return fixture.sheet
    ? new Set([resolve(fixture.sheet)])
    : fixture.families.reduce((acc, family) => collect(`${dist}/${family}.css`, acc, true), new Set())
}

/*
 * Syntax the source never writes, so finding it in dist/ means the build lowered something.
 * The browser suites run source CSS, so this is the only place a lowering shows.
 */
export const LOWERED = [
  { pattern: /:lang\(/, reason: ':dir() rewritten as a language list, which ignores dir="rtl" — build.cssTarget is below browserFloor (vite.shared.ts)' },
]

/** `file: reason` for every shipped sheet holding lowered syntax. */
export function loweredSyntax(dist = 'dist') {
  const sheets = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? sheets(join(dir, entry.name)) : entry.name.endsWith('.css') ? [join(dir, entry.name)] : [],
    )
  return sheets(dist).flatMap((file) => {
    const css = readFileSync(file, 'utf8')
    return LOWERED.filter(({ pattern }) => pattern.test(css)).map(({ reason }) => `${file}: ${reason}`)
  })
}

/* The report runs only when this file is the program, so tests can import it without dist/. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  report()
}

function report() {
let over = 0
console.log()
for (const fixture of FIXTURES) {
  const files = resolveFixture(fixture)
  const body = [...files].map((file) => readFileSync(file, 'utf8')).join('')
  const gzip = gzipSync(body).length
  const budget = fixture.budgetBytes ?? fixture.budgetKb * 1024
  const ok = gzip <= budget
  if (!ok) over++
  console.log(
    `  ${ok ? 'ok  ' : 'OVER'}  ${fixture.name.padEnd(34)} ` +
      `${String(Math.round(gzip / 1024)).padStart(3)}KB gzip / ${fixture.budgetKb}KB budget` +
      `   ${String(files.size).padStart(3)} sheets, ${Math.round(body.length / 1024)}KB raw`,
  )
}

const whole = statSync(BUDGETS.catalogue.sheet).size
const one = gzipSync(readFileSync(BUDGETS.catalogue.sheet, 'utf8')).length
console.log(
  `\n  the catalogue is ${Math.round(whole / 1024)}KB raw / ${one} bytes gzip — ` +
    `target ${BUDGETS.catalogue.targetGzipBytes}, hard ceiling ${BUDGETS.catalogue.hardGzipBytes}, ` +
    `${BUDGETS.catalogue.targetGzipBytes - one} bytes of headroom.`,
)

const lowered = loweredSyntax()
if (lowered.length) {
  console.log(`\nFAIL css-budget — the build lowered syntax the browser floor supports:\n  ${lowered.join('\n  ')}`)
  process.exit(1)
}

/* Reported apart from the fixtures: over target fails as a fixture, over hard breaks the contract. */
if (one > BUDGETS.catalogue.hardGzipBytes) {
  console.log(`\nFAIL css-budget — the catalogue is ${one} gzip bytes, over the hard ceiling of ${BUDGETS.catalogue.hardGzipBytes}`)
  process.exit(1)
}
if (over) {
  console.log(`\nFAIL css-budget — ${over} fixture(s) over budget`)
  process.exit(1)
}
console.log('\nPASS css-budget — every representative consumer is inside its budget.')
}
