/*
 * The repository's checks, run by one command. Static checks run in parallel beside the
 * unit tests and a single library build; the checks that read dist/ follow the build.
 *
 *   node scripts/verify.mjs                  the static and dist checks (`npm run verify`)
 *   node scripts/verify.mjs factors bem      only those checks (no build unless one needs dist/)
 *   node scripts/verify.mjs --gates          the checkers' own self-tests
 *   node scripts/verify.mjs --consumer       the packed-package checks
 *   node scripts/verify.mjs --all            all of the above and the reference apps, one build
 *   node scripts/verify.mjs --no-build       with any of them: use the dist/ already there
 *   node scripts/verify.mjs --list           every check and its command
 *
 * A check's output prints only when it fails. The exit code is the number of failures.
 */
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { availableParallelism } from 'node:os'

import { RULES } from './verify-css.mjs'

const node = (file) => `node scripts/${file}.mjs`

/** `dist` checks run after the build; the rest run beside it. */
const CHECKS = [
  /* Vitest allows `.only` unless CI is set; a focused test must fail the run on any machine. */
  { id: 'unit', command: 'npx vitest run --allowOnly=false' },
  { id: 'lint', command: 'npx oxlint --deny-warnings' },
  /* Every CSS contract in one pass; CSS_GROUPS runs one group by name. */
  { id: 'css', command: node('verify-css') },
  { id: 'strings', command: node('verify-strings') },
  { id: 'docs-coverage', command: node('verify-docs-coverage') },
  { id: 'architecture', command: node('verify-architecture-manifest') },
  { id: 'api-vocabulary', command: node('verify-api-vocabulary') },
  { id: 'selection', command: node('verify-selection') },
  { id: 'migrations', command: node('verify-migrations') },
  { id: 'documented-defaults', command: node('verify-documented-defaults') },
  { id: 'consumer-scripts', command: 'node --test scripts/consumer/*.test.mjs scripts/tailwind-bridge.test.mjs' },
  { id: 'api-snapshot', command: node('verify-api-snapshot'), dist: true },
  { id: 'css-budget', command: node('css-budget'), dist: true },
  /* Runs the generators and compares their output, so it goes last and alone. */
  { id: 'docs-freshness', command: node('verify-docs-freshness'), dist: true, alone: true },
]

/* Named only, never in the default set: `verify composition` runs that group of `css`. */
const CSS_GROUPS = Object.keys(RULES).map((id) => ({ id, command: `${node('verify-css')} ${id}` }))

/* The packed package, from a tarball: one at a time, since several `npm pack` and install. */
const CONSUMER = [
  { id: 'rsc', command: node('verify-rsc-boundaries') },
  { id: 'dtcg-tokens', command: node('verify-dtcg-tokens') },
  { id: 'package', command: node('verify-package') },
  { id: 'packed-imports', command: node('verify-packed-imports') },
  { id: 'package-quality', command: node('verify-package-quality') },
  { id: 'consumer-fixtures', command: node('verify-consumer-fixtures') },
  { id: 'doc-examples', command: node('verify-doc-examples') },
]
const REFERENCE = { id: 'reference-consumers', command: node('verify-reference-consumers') }

const BUILD = { id: 'build', command: 'npm run build:lib' }
/* Without a build, `tsc -b` still has to run; the build runs it itself. */
const TYPECHECK = { id: 'typecheck', command: 'npx tsc -b' }

/*
 * Self-tests: each proves its checker fails on the defect it names. The two in EDITS write a
 * tracked file and restore it, so they run one at a time after the rest, and never beside a
 * browser suite. The consumer-script tests already run in `consumer-scripts`.
 */
const EDITS = ['api-vocabulary', 'architecture-manifest'].map((name) => `scripts/verify-${name}.test.mjs`)
const selfTests = readdirSync('scripts', { recursive: true })
  .map((file) => `scripts/${file}`)
  .filter((file) => file.endsWith('.test.mjs') && !file.startsWith('scripts/consumer/') && !file.endsWith('tailwind-bridge.test.mjs'))
  .sort()
const GATES = {
  id: 'gates',
  command:
    `node --test ${selfTests.filter((file) => !EDITS.includes(file)).join(' ')} && ` +
    `node --test --test-concurrency=1 ${EDITS.join(' ')}`,
}

function run({ id, command }) {
  const started = performance.now()
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, env: { ...process.env, FORCE_COLOR: '0' } })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk))
    child.stderr.on('data', (chunk) => (output += chunk))
    child.on('close', (code) => {
      const seconds = ((performance.now() - started) / 1000).toFixed(1)
      console.log(`${code === 0 ? 'ok  ' : 'FAIL'}  ${id.padEnd(24)} ${seconds.padStart(5)}s`)
      if (code !== 0) console.log(`\n${output.trim()}\n`)
      resolve(code === 0)
    })
  })
}

/** Run `tasks` with at most `limit` at once; resolves to the ids that failed. */
async function pool(tasks, limit) {
  const failed = []
  const queue = [...tasks]
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) {
        const task = queue.shift()
        if (!(await run(task))) failed.push(task.id)
      }
    }),
  )
  return failed
}

async function main(args) {
  const every = [TYPECHECK, BUILD, ...CHECKS, ...CSS_GROUPS, ...CONSUMER, REFERENCE]
  if (args.includes('--list')) {
    for (const check of [...every, GATES]) console.log(`${check.id.padEnd(24)} ${check.command}`)
    return 0
  }
  const all = args.includes('--all')
  const named = args.filter((arg) => !arg.startsWith('--'))
  const unknown = named.filter((id) => !every.some((check) => check.id === id))
  if (unknown.length) {
    console.error(`unknown check(s): ${unknown.join(', ')} — \`node scripts/verify.mjs --list\` names them all`)
    return 1
  }

  /* A group flag alone runs only that group; no flag and no names runs the default set. */
  const consumer = all || args.includes('--consumer')
  const gates = all || args.includes('--gates')
  const byName = (list) => list.filter((check) => named.includes(check.id))
  const chosen = named.length ? byName([...CHECKS, ...CSS_GROUPS]) : all || !(consumer || gates) ? CHECKS : []
  const packed = named.length ? [...byName(CONSUMER), ...byName([REFERENCE])] : consumer ? [...CONSUMER, ...(all ? [REFERENCE] : [])] : []
  const needsDist = packed.length > 0 || chosen.some((check) => check.dist)
  const build = !args.includes('--no-build') && (named.includes('build') || needsDist)
  const limit = Math.max(2, availableParallelism() - 2)
  const started = performance.now()
  const failed = []

  /*
   * Self-tests first and alone: two edit and restore a source file, which would race the
   * checks reading it and leave it newer than dist/.
   */
  if (gates) failed.push(...(await pool([GATES], 1)))

  /* The build (with its own tsc -b) runs beside the static checks; dist checks wait for it. */
  const building = build ? pool([BUILD], 1) : Promise.resolve([])
  const alongside = chosen.filter((check) => !check.dist)
  if (!build && (named.includes('typecheck') || (!named.length && chosen.length))) alongside.unshift(TYPECHECK)
  failed.push(...(await pool(alongside, limit)), ...(await building))

  if (!failed.includes('build')) {
    const after = chosen.filter((check) => check.dist)
    failed.push(...(await pool(after.filter((check) => !check.alone), limit)))
    for (const check of after.filter((check) => check.alone)) failed.push(...(await pool([check], 1)))
    failed.push(...(await pool(packed, 1)))
  }

  const seconds = ((performance.now() - started) / 1000).toFixed(0)
  console.log(failed.length ? `\nFAIL verify — ${failed.join(', ')} (${seconds}s)` : `\nPASS verify — ${seconds}s`)
  return failed.length
}

process.exitCode = await main(process.argv.slice(2))
