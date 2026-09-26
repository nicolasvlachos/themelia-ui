/*
 * Writes the suites block of tests/README.md from the suites themselves: each spec's file,
 * its first opening-comment sentence, its npm script, the Playwright projects and the unit
 * test files. Only the region between the markers is rewritten; prose outside stays by hand.
 * Checked by verify docs-freshness, so a spec's first comment is public documentation.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { writeIfChanged } from './lib/write-if-changed.mjs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const config = readFileSync('playwright.config.ts', 'utf8')

const projects = [...config.matchAll(/name:\s*["']([\w-]+)["']/g)].map((match) => match[1])

/** The first sentence of a spec's opening block comment, capped at 200 characters. */
function summarise(text) {
  const comment = text.match(/^\/\*\*?([\s\S]*?)\*\//)
  if (!comment) return ''
  const body = comment[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*!?\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
  const sentence = body.split(/(?<=\.)\s/)[0] ?? body
  return sentence.length > 200 ? `${sentence.slice(0, 197)}…` : sentence
}

/* Recursive, both suffixes: matches Playwright's default `testMatch`, so every run spec is listed. */
const specs = readdirSync('tests', { recursive: true })
  .map(String)
  .filter((file) => /\.(spec|test)\.ts$/.test(file))

const suites = specs
  .sort()
  .map((file) => {
    const text = readFileSync(`tests/${file}`, 'utf8')
    const name = file.replace(/\.(spec|test)\.ts$/, '')
    const script = Object.entries(pkg.scripts).find(
      ([key, value]) => key.startsWith('test:') && !key.includes('update') && value === `playwright test ${name}`,
    )?.[0]
    return {
      file,
      name,
      script,
      tests: (text.match(/^\s*test\(/gm) ?? []).length,
      describes: (text.match(/test\.describe\(/g) ?? []).length,
      summary: summarise(text),
    }
  })

const unit = readdirSync('src', { recursive: true }).filter(
  (file) => typeof file === 'string' && /\.test\.tsx?$/.test(file),
)

const lines = [
  '<!-- GENERATED:suites by scripts/gen-test-docs.mjs — do not edit between these markers. -->',
  `${suites.length} Playwright suites over the docs site, and ${unit.length} unit test files beside the`,
  'code they cover.',
  '',
  '| suite | covers | script |',
  '| --- | --- | --- |',
  ...suites.map(
    (suite) =>
      `| \`${suite.file}\` | ${suite.summary || '—'} | ${suite.script ? `\`npm run ${suite.script}\`` : 'runs under `npm test`'} |`,
  ),
  '',
  `Playwright projects: ${projects.map((project) => `\`${project}\``).join(', ')}.`,
  '',
  'Unit tests run separately, under `npm run test:unit`, and are in the `verify` chain. They',
  'cover what a route cannot reach — SSR, hydration, two roots arbitrating over the document,',
  'portals, and hook behaviour across prop changes.',
  '',
  ...unit.sort().map((file) => `- \`src/${file}\``),
  '<!-- /GENERATED:suites -->',
]

const readme = readFileSync('tests/README.md', 'utf8')
const open = '<!-- GENERATED:suites by scripts/gen-test-docs.mjs — do not edit between these markers. -->'
const close = '<!-- /GENERATED:suites -->'
const from = readme.indexOf(open)
const to = readme.indexOf(close)
const next =
  from === -1 || to === -1
    ? readme.replace(/^# Tests\n/, `# Tests\n\n${lines.join('\n')}\n`)
    : readme.slice(0, from) + lines.join('\n') + readme.slice(to + close.length)

writeIfChanged('tests/README.md', next)
console.log(`test docs: ${suites.length} Playwright suites, ${unit.length} unit files, ${projects.length} project(s)`)
