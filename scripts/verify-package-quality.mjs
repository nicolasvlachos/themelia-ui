/*
 * Checks public-registry metadata, then runs publint and arethetypeswrong on the packed
 * tarball: they test the exports map against real consumer resolution (e.g. `require` must
 * reach CJS declarations), which this repo's bundler-resolution typecheck cannot see.
 * Stylesheet subpaths resolve to no types, so attw skips them by name, computed from the
 * exports map so a JS subpath can never be excluded by accident.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []

/* ── registry intent: the public package name and the deliberate fast path ────────── */
if (pkg.name !== 'themelia-ui') {
  failures.push('package.json#name must be the public unscoped package "themelia-ui"')
}

if (pkg.private !== false) {
  failures.push('package.json must declare "private": false')
}

if (pkg.publishConfig?.access !== 'public') {
  failures.push('package.json#publishConfig.access must be "public"')
}

if (pkg.repository?.type !== 'git' || typeof pkg.repository?.url !== 'string') {
  failures.push('package.json must declare a Git repository URL')
}

if (typeof pkg.homepage !== 'string' || typeof pkg.bugs?.url !== 'string') {
  failures.push('package.json must declare homepage and issue-tracker URLs')
}

if (pkg.scripts?.['publish:without-tests'] !== 'npm publish --ignore-scripts --access public') {
  failures.push('package.json must provide the explicit public publish:without-tests escape hatch')
}

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
    /* `node16`, not the default `strict`: that also demands Node 10, which predates exports maps. */
    const attw = run('npx', ['attw', tarball, '--profile', 'node16', '--exclude-entrypoints', ...cssEntrypoints])
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
  `PASS verify package-quality — public registry and repository metadata present; publint --strict clean; ` +
    `every non-CSS entrypoint resolves to ` +
    `the right declarations from ESM and from CJS (${cssEntrypoints.length} stylesheet subpaths excluded).`,
)
