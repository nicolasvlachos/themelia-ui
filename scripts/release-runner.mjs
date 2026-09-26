/*
 * `npm run verify:release`: every check, then every browser suite, on a clean tree, on macOS.
 * Stops at the first failure. A PASS is about the commit it prints and no other.
 *
 * This is the release gate. `npm publish` runs it through `prepublishOnly` with `--publish`,
 * which first refuses a version npm already has or the CHANGELOG does not name. A stray
 * `.only` fails it: Vitest allows one unless `CI` is set and Playwright unless `forbidOnly`
 * is, so `verify.mjs` passes `--allowOnly=false` and the browser step `--forbid-only`.
 */
import { execFileSync, execSync, spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const fail = (message) => {
  console.error(`FAIL verify:release — ${message}`)
  process.exit(1)
}
const changed = () => execSync('git status --porcelain', { encoding: 'utf8' }).trim()

if (changed()) fail('the working tree is dirty; commit first, so what passes is what ships')
/* The pixel baselines are Chromium on Darwin; elsewhere playwright.config.ts skips them. */
if (process.platform !== 'darwin') fail(`run it on macOS; on ${process.platform} the visual baselines are skipped`)

if (process.argv.includes('--publish')) {
  const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'))
  let published = ''
  try {
    published = execFileSync('npm', ['view', `${name}@${version}`, 'version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    /* Not on the registry (E404), or offline: npm refuses a duplicate at upload either way. */
  }
  if (published) fail(`${name}@${version} is already published; bump the version first`)
  /* The exact version, so `## 2.0.2-beta.1` does not stand in for 2.0.2. */
  const heading = new RegExp(`^## ${version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'm')
  if (!heading.test(readFileSync('CHANGELOG.md', 'utf8'))) {
    fail(`CHANGELOG.md has no "## ${version}" heading`)
  }
}
const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

/*
 * An hour per step: a hung browser or server fails the gate instead of holding it forever.
 * Each step runs in its own process group, so a timeout, or Ctrl-C passed on to it, stops
 * every check and browser the step started, not only the shell that launched them.
 */
const STEP_MS = 60 * 60 * 1000
function step(command) {
  return new Promise((done) => {
    const child = spawn(command, { shell: true, stdio: 'inherit', detached: true })
    const signalGroup = (signal) => {
      try {
        process.kill(-child.pid, signal)
      } catch {
        /* The group has already exited. */
      }
    }
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      signalGroup('SIGTERM')
      setTimeout(() => signalGroup('SIGKILL'), 10_000).unref()
    }, STEP_MS)
    const interrupt = () => signalGroup('SIGINT')
    process.on('SIGINT', interrupt)
    child.on('exit', (code, signal) => {
      clearTimeout(timer)
      process.off('SIGINT', interrupt)
      done({ code, signal, timedOut })
    })
  })
}

for (const command of ['node scripts/verify.mjs --all', 'npx playwright test --forbid-only']) {
  console.log(`\n▸ ${command}`)
  const { code, signal, timedOut } = await step(command)
  if (code === 0) continue
  const how = timedOut ? `ran past ${STEP_MS / 60_000} minutes` : signal ? `was stopped (${signal})` : `exited ${code}`
  fail(`\`${command}\` ${how} on ${commit}`)
}

/* A generator or the build rewrote a tracked file: the committed output was stale. */
if (changed()) fail(`the run changed tracked files; commit them and re-run:\n${changed()}`)
console.log(`\nPASS verify:release — ${commit}`)
