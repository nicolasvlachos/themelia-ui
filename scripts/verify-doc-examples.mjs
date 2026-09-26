/*
 * Compiles the consumer docs' code blocks (docs/learn, the themelia-ui skill) against the built
 * package. Every ts/tsx/js/jsx fence needs a marker: `compile`, or `fragment — <why not>`;
 * an unmarked block, a reasonless fragment, or a type error fails. Runs against `dist/` (so
 * after a build, in `verify:consumer`): a source alias would accept unexported subpaths.
 * Shims are typed `any` so using an assumed name is not itself an error.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { stripVTControlCharacters } from 'node:util'

const DOCS = execSync('find docs/learn .agents/skills/themelia-ui -name "*.md" 2>/dev/null || true')
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

if (!existsSync('dist')) {
  console.error('FAIL verify doc-examples — dist/ is missing; run `npm run build:lib` first')
  process.exit(1)
}

const OUT = 'node_modules/.cache/doc-examples'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(`${OUT}/src`, { recursive: true })

/** doc file → the line each extracted example starts on, so an error can name its source. */
const origin = new Map()
const unmarked = []
let count = 0
let fragments = 0

for (const doc of DOCS) {
  const text = readFileSync(doc, 'utf8')
  /* The lookahead is load-bearing: without it `js` matches the start of ```json. */
  for (const block of text.matchAll(/```(tsx?|jsx?)(?![a-z])([^\n]*)\n([\s\S]*?)```/g)) {
    const marker = block[2].trim()
    const body = block[3]
    const line = text.slice(0, block.index).split('\n').length

    /* The marker is declared, never inferred; `fragment` carries its reason on the fence. */
    if (marker === 'compile') {
      const name = `ex${String(++count).padStart(3, '0')}.tsx`
      writeFileSync(`${OUT}/src/${name}`, body.endsWith('\n') ? body : `${body}\n`)
      origin.set(name, `${doc}:${line}`)
      continue
    }

    if (marker.startsWith('fragment')) {
      const reason = marker.slice('fragment'.length).replace(/^[\s—-]+/, '').trim()
      if (reason === '') {
        unmarked.push(`${doc}:${line}  marked \`fragment\` with no reason`)
      } else {
        fragments++
      }
      continue
    }

    unmarked.push(
      `${doc}:${line}  \`\`\`${block[1]}${marker ? ` ${marker}` : ''} — mark it \`compile\`, ` +
        'or `fragment — <why not>`',
    )
  }
}

if (unmarked.length > 0) {
  console.log(`FAIL verify doc-examples — ${unmarked.length} unmarked code block(s)\n`)
  for (const line of unmarked) console.log(`  ${line}`)
  process.exit(1)
}

writeFileSync(
  `${OUT}/shims.d.ts`,
  [
    '/* A bundler resolves these; tsc needs telling. Not a documentation defect. */',
    'declare module "*.css"',
    '',
    '/* Names a snippet assumes from the prose around it. `any`, so using one is not an error. */',
    'declare const useForm: any',
    'declare const form: any',
    '',
  ].join('\n'),
)

writeFileSync(
  `${OUT}/tsconfig.json`,
  `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        jsx: 'react-jsx',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        /* A snippet destructures props without declaring their type; that is prose, not a bug. */
        noImplicitAny: false,
        noEmit: true,
        skipLibCheck: true,
        types: [],
      },
      include: ['src', 'shims.d.ts'],
    },
    null,
    2,
  )}\n`,
)

/* `themelia-ui` links to the repo root, whose `exports` map points at `dist/`, as a consumer's would. */
const root = resolve('.')
mkdirSync(`${OUT}/node_modules`, { recursive: true })
for (const [link, target] of [
  ['react', `${root}/node_modules/react`],
  ['react-dom', `${root}/node_modules/react-dom`],
  ['@types', `${root}/node_modules/@types`],
  ['themelia-ui', root],
]) {
  const destination = `${OUT}/node_modules/${link}`
  mkdirSync(dirname(destination), { recursive: true })
  symlinkSync(target, destination, 'dir')
}

let output = ''
let failed = false
try {
  execSync(`npx tsc -p ${OUT}/tsconfig.json`, { stdio: 'pipe' })
} catch (error) {
  failed = true
  output = stripVTControlCharacters(`${error.stdout ?? ''}${error.stderr ?? ''}`)
}

if (failed) {
  const problems = output
    .split('\n')
    .filter((line) => /error TS/.test(line))
    .map((line) => {
      const match = line.match(/(ex\d+\.tsx)\((\d+),(\d+)\): (.*)/)
      if (!match) return `  ${line.trim()}`
      const where = origin.get(match[1]) ?? match[1]
      /* Document line of the block, plus the error's offset within it. */
      return `  ${where} (+${match[2]})  ${match[4]}`
    })

  console.error(`FAIL verify doc-examples — ${problems.length} problem(s) in ${count} compiled example(s)\n`)
  for (const problem of problems) console.error(problem)
  console.error('\n  The documentation shows code a consumer cannot compile. Fix the example,')
  console.error('  or the component, depending on which one is wrong.')
  process.exit(1)
}

console.log(
  `PASS verify doc-examples — ${count} self-contained example(s) across ${DOCS.length} documents ` +
    'compile against the built package.',
)
