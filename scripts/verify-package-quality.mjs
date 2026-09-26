/*
 * Runs publint and arethetypeswrong on the packed tarball: they test the exports map against
 * real consumer resolution (Node's ESM resolver as well as a bundler's), which this repo's
 * bundler-resolution typecheck cannot see.
 * Stylesheet subpaths resolve to no types, so attw skips them by name, computed from the
 * exports map so a JS subpath can never be excluded by accident.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []

const run = (command, args) => {
  try {
    return { ok: true, out: execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }
  } catch (error) {
    return { ok: false, out: `${error.stdout ?? ''}${error.stderr ?? ''}` }
  }
}

/* ── publint: the exports map, the files field, and the shape of the archive ──────── */
const publint = run('npx', ['publint', '--strict'])
if (!publint.ok) {
  failures.push('publint reported errors:')
  for (const line of publint.out.split('\n').filter((l) => /^\d+\./.test(l.trim()))) {
    failures.push(`    ${line.trim()}`)
  }
}

/* ── arethetypeswrong: what each entrypoint's TYPES resolve to, per module system ─── */
const cssEntrypoints = Object.keys(pkg.exports)
  .filter((subpath) => subpath.endsWith('.css'))
  .map((subpath) => (subpath === '.' ? pkg.name : `${pkg.name}${subpath.slice(1)}`))

let tarball = null
try {
  tarball = execFileSync('npm', ['pack', '--silent'], { encoding: 'utf8' })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .pop()

  if (!tarball || !existsSync(tarball)) {
    failures.push('npm pack produced no tarball')
  } else {
    /* `esm-only`: the package ships no CommonJS, so `require` resolution is not a consumer path. */
    const attw = run('npx', ['attw', tarball, '--profile', 'esm-only', '--exclude-entrypoints', ...cssEntrypoints])
    if (!attw.ok) {
      failures.push('arethetypeswrong reported problems:')
      for (const line of attw.out.split('\n')) {
        if (/💀|👺|🥴|❌/.test(line)) failures.push(`    ${line.trim()}`)
      }
    }
  }
} finally {
  if (tarball) {
    try {
      unlinkSync(tarball)
    } catch {
      /* Leaving the archive behind is untidy, not a failure. */
    }
  }
}

if (failures.length > 0) {
  console.log(`FAIL verify package-quality — ${failures.length} line(s)\n`)
  for (const line of failures) console.log(`  ${line}`)
  process.exit(1)
}

console.log(
  `PASS verify package-quality — publint --strict clean; ` +
    `every non-CSS entrypoint resolves to its declarations under Node and bundler resolution ` +
    `(${cssEntrypoints.length} stylesheet subpaths excluded).`,
)
