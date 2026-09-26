/*
 * What a consumer actually receives: assertions on the PACKED file list (`npm pack`), not
 * the checkout — the skill, its index and links, the consumer scripts, nothing maintainer-only.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, normalize } from 'node:path'
import { test } from 'node:test'

import { SOURCE, listFiles } from './install-skill.mjs'

const PACKAGE_NAME = 'themelia-ui'
const OWN_SCRIPTS = new Set(Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).scripts))
/* Names every application has; a doc telling a consumer to run their own build is fine. */
const GENERIC_SCRIPTS = new Set(['build', 'dev', 'test', 'lint', 'typecheck', 'start', 'preview'])
const SKILL_PATH = '.agents/skills/themelia-ui'

/** The file list npm would publish, without writing a tarball. */
const packed = (() => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    /* A package check must not depend on the user's global npm cache permissions. */
    env: {
      ...process.env,
      npm_config_cache: join(tmpdir(), 'themelia-ui-npm-cache'),
    },
  })
  return JSON.parse(out)[0].files.map((f) => f.path)
})()

test('the published package uses the Themelia identity', () => {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
  assert.equal(manifest.name, PACKAGE_NAME)
})

test('the tarball carries the consumer skill and its index', () => {
  for (const required of [
    `${SKILL_PATH}/SKILL.md`,
    `${SKILL_PATH}/references/components/INDEX.json`,
    `${SKILL_PATH}/references/components/INDEX.md`,
    `${SKILL_PATH}/references/components/base--buttons.md`,
    `${SKILL_PATH}/references/imports.md`,
    'docs/README.md',
    'docs/learn/composition.md',
    'docs/learn/framework-wiring.md',
    'docs/learn/troubleshooting.md',
    'docs/learn/verification.md',
    'docs/generated/components/base--buttons.md',
    'docs/build/recipes.md',
    'src/styles/TOKENS.md',
    'scripts/consumer/install-skill.mjs',
    'scripts/consumer/find-component.mjs',
    'scripts/consumer/codemod.mjs',
    'docs/generated/migration.md',
    'docs/generated/migration-codemod.json',
    'docs/generated/migration-broad-imports.json',
  ]) {
    assert.ok(packed.includes(required), `${required} is not in the tarball`)
  }
})

test('every file of the canonical skill is packed', () => {
  /* A partial skill is worse than none: it reads as complete and is missing a reference. */
  const missing = listFiles(SOURCE)
    .map((file) => `${SKILL_PATH}/${file}`)
    .filter((path) => !packed.includes(path))
  assert.deepEqual(missing, [])
})

test('maintainer-only material and implementation source stay out of the tarball', () => {
  const publishedStyleDocs = new Set([
    'src/styles/TOKENS.md',
    'src/styles/FACTORS.md',
    'src/styles/SCOPES.md',
  ])
  const leaked = packed.filter((p) =>
    p.startsWith('.claude/') ||
    p.startsWith('docs/maintainers/') ||
    p.startsWith('tests/') ||
    (p.startsWith('src/') && !publishedStyleDocs.has(p)) ||
    p.endsWith('.test.mjs'),
  )
  assert.deepEqual(leaked, [])
})

test('no packed skill file names this checkout', () => {
  const offenders = listFiles(SOURCE).filter((file) =>
    readFileSync(join(SOURCE, file), 'utf8').includes(process.cwd()),
  )
  assert.deepEqual(offenders, [])
})

test('every markdown link inside the packed skill resolves inside it', () => {
  /* References are copied from `docs/learn/`, whose relative links may not exist here. */
  const files = listFiles(SOURCE)
  const present = new Set(files)
  const broken = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const body = readFileSync(join(SOURCE, file), 'utf8')
    for (const [, target] of body.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|#|mailto:)/.test(target)) continue
      const clean = target.split('#')[0]
      if (!clean) continue
      const resolved = normalize(join(dirname(file), clean))
      if (!present.has(resolved)) broken.push(`${file} → ${target}`)
    }
  }
  assert.deepEqual(broken, [])
})

test('every installed-package path the skill names exists in the tarball', () => {
  /* Every file, not only SKILL.md: the references name the codemod and the changelog too. */
  const paths = listFiles(SOURCE)
    .filter((file) => file.endsWith('.md'))
    .flatMap((file) => [...readFileSync(join(SOURCE, file), 'utf8').matchAll(/node_modules\/themelia-ui\/([A-Za-z0-9_./-]+)/g)])
    .map((match) => match[1].replace(/[.,;:]$/, ''))
  assert.ok(paths.length >= 3, 'the skill names no installed-package documentation authorities')
  assert.deepEqual([...new Set(paths.filter((path) => !packed.includes(path)))], [])
})

test('consumer prose does not instruct agents to use maintainer-only scripts or missing skills', () => {
  const offenders = []
  for (const file of listFiles(SOURCE)) {
    if (!file.endsWith('.md') || file.startsWith('references/components/')) continue
    const body = readFileSync(join(SOURCE, file), 'utf8')
    if (/`(?:token-system|css-tokens)`\s+skill/.test(body)) offenders.push(`${file}: missing skill`)
    if (/`(?:scripts\/(?:verify|theme-manifest|strings-exceptions)[^`]*|npm run (?:verify|tokens:)[^`]*)`/.test(body)) {
      offenders.push(`${file}: maintainer command or script`)
    }
    /* THIS package's npm scripts do not exist in a consumer's project; name the node_modules path. */
    for (const [, script] of body.matchAll(/npm run ([\w:-]+)/g)) {
      if (OWN_SCRIPTS.has(script) && !GENERIC_SCRIPTS.has(script)) offenders.push(`${file}: npm run ${script} is this repository's script`)
    }
  }
  assert.deepEqual(offenders, [])
})

test('the packed component index keeps one navigable API link per family', () => {
  const body = readFileSync(join(SOURCE, 'references/components/INDEX.md'), 'utf8')
  const links = [...body.matchAll(/\[API\]\((\.\/[^)]+\.md)\)/g)]
  const index = JSON.parse(
    readFileSync(join(SOURCE, 'references/components/INDEX.json'), 'utf8'),
  )
  assert.equal(links.length, index.families.length)
})

test('the skill optional-peer table agrees with the component index', () => {
  const skill = readFileSync(join(SOURCE, 'SKILL.md'), 'utf8')
  const index = JSON.parse(
    readFileSync(join(SOURCE, 'references/components/INDEX.json'), 'utf8'),
  )
  const byPeer = new Map()
  for (const family of index.families) {
    for (const peer of family.optionalPeers) {
      if (!byPeer.has(peer)) byPeer.set(peer, [])
      byPeer.get(peer).push(family.family)
    }
  }
  for (const [peer, families] of byPeer) {
    const row = `| \`${peer}\` | ${families.map((family) => `\`${family}\``).join(', ')} |`
    assert.ok(skill.includes(row), `SKILL.md omits or misattributes ${peer}`)
  }
})

test('the shipped scripts run from an extracted tarball, the way a consumer gets them', () => {
  /* Runs the packed scripts: their data paths resolve relative to node_modules, not this checkout. */
  const dir = mkdtempSync(join(tmpdir(), 'themelia-tarball-'))
  try {
    const env = { ...process.env, npm_config_cache: join(tmpdir(), 'themelia-ui-npm-cache') }
    const [{ filename }] = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', dir], { encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024 }))
    const app = join(dir, 'app')
    const installed = join(app, 'node_modules', PACKAGE_NAME)
    mkdirSync(installed, { recursive: true })
    mkdirSync(join(app, 'src'))
    execFileSync('tar', ['-xzf', join(dir, filename), '-C', installed, '--strip-components=1'])
    writeFileSync(join(app, 'package.json'), '{"name":"consumer-app","private":true}')
    writeFileSync(join(app, 'src', 'app.css'), '.card { border-radius: var(--radius-surface); }\n')
    const run = (script, args) => execFileSync('node', [join(installed, 'scripts/consumer', script), ...args], { cwd: app, encoding: 'utf8' })

    assert.match(run('install-skill.mjs', ['--project=.']), /installed \d+ file/)
    for (const target of ['.agents', '.claude']) {
      assert.ok(readFileSync(join(app, target, 'skills/themelia-ui/SKILL.md'), 'utf8').includes('name: themelia-ui'))
    }
    assert.ok(existsSync(join(app, '.agents/skills/themelia-ui/references/components/INDEX.json')))

    assert.match(run('find-component.mjs', ['menu bar across the top']), /base\/menubar[\s\S]*with\s+base\/dropdown-menu/)
    assert.match(run('find-component.mjs', ['key value facts']), new RegExp(`${PACKAGE_NAME}/base/display\\.css`))
    /* A search that finds nothing must fail, or a script looking for a component carries on. */
    assert.throws(() => run('find-component.mjs', ['zzzz-no-such-component']), (error) => /no component matches/.test(`${error.stderr}`))

    const dry = run('codemod.mjs', ['--dry-run', 'src'])
    assert.match(dry, /--radius-surface → --radius/)
    assert.match(dry, /node_modules\/themelia-ui\/docs\/generated\/migration\.md/)
    run('codemod.mjs', ['src'])
    assert.equal(readFileSync(join(app, 'src', 'app.css'), 'utf8'), '.card { border-radius: var(--radius); }\n')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
