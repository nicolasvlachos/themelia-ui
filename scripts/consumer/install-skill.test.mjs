/*
 * The installer a consumer runs once, out of node_modules, with no network.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import {
  GENERATED_MARKER, SOURCE, TARGET_DIRECTORIES, installSkill, listFiles, mayOverwrite,
} from './install-skill.mjs'

const project = () => mkdtempSync(join(tmpdir(), 'kit-skill-'))

test('the canonical skill exists where the installer looks for it', () => {
  assert.ok(existsSync(SOURCE), `no skill at ${SOURCE}`)
  const files = listFiles(SOURCE)
  assert.ok(files.includes('SKILL.md'), 'no SKILL.md')
  assert.ok(files.includes('references/components/INDEX.json'), 'no component index')
  assert.ok(files.length >= 10, `only ${files.length} files in the skill`)
})

test('the canonical SKILL.md carries the marker the installer trusts', () => {
  /* Without it, the first upgrade would refuse to replace the skill this package installed. */
  assert.match(readFileSync(join(SOURCE, 'SKILL.md'), 'utf8'), new RegExp(GENERATED_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('both targets are installed by default', () => {
  const dir = project()
  try {
    installSkill({ project: dir })
    for (const relative of Object.values(TARGET_DIRECTORIES)) {
      assert.ok(existsSync(join(dir, relative, 'SKILL.md')), `${relative} missing`)
      assert.ok(existsSync(join(dir, relative, 'references/components/INDEX.json')), `${relative} index missing`)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a named target installs only itself', () => {
  const dir = project()
  try {
    installSkill({ project: dir, target: 'agents' })
    assert.ok(existsSync(join(dir, TARGET_DIRECTORIES.agents, 'SKILL.md')))
    assert.ok(!existsSync(join(dir, TARGET_DIRECTORIES.claude)), 'claude was installed anyway')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('installing twice is safe — the second run replaces the first', () => {
  const dir = project()
  try {
    installSkill({ project: dir, target: 'agents' })
    installSkill({ project: dir, target: 'agents' })
    assert.deepEqual(listFiles(join(dir, TARGET_DIRECTORIES.agents)), listFiles(SOURCE))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('reinstalling removes stale files from an older generated skill', () => {
  const dir = project()
  try {
    installSkill({ project: dir, target: 'agents' })
    const stale = join(dir, TARGET_DIRECTORIES.agents, 'references/stale-from-old-version.md')
    writeFileSync(stale, '# obsolete\n')
    installSkill({ project: dir, target: 'agents' })
    assert.ok(!existsSync(stale), 'a stale generated file survived reinstall')
    assert.deepEqual(listFiles(join(dir, TARGET_DIRECTORIES.agents)), listFiles(SOURCE))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a hand-written skill of the same name is refused, not overwritten', () => {
  const dir = project()
  try {
    const destination = join(dir, TARGET_DIRECTORIES.agents)
    mkdirSync(destination, { recursive: true })
    writeFileSync(join(destination, 'SKILL.md'), '# my own notes\n')

    assert.equal(mayOverwrite(destination), false)
    assert.throws(() => installSkill({ project: dir, target: 'agents' }), /did not write/)
    assert.equal(readFileSync(join(destination, 'SKILL.md'), 'utf8'), '# my own notes\n')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('all destinations are preflighted before either destination is written', () => {
  const dir = project()
  try {
    const handwritten = join(dir, TARGET_DIRECTORIES.claude)
    mkdirSync(handwritten, { recursive: true })
    writeFileSync(join(handwritten, 'SKILL.md'), '# my own Claude skill\n')

    assert.throws(() => installSkill({ project: dir }), /did not write/)
    assert.ok(
      !existsSync(join(dir, TARGET_DIRECTORIES.agents)),
      'the agents target was written before the Claude target rejected the install',
    )
    assert.equal(readFileSync(join(handwritten, 'SKILL.md'), 'utf8'), '# my own Claude skill\n')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('an unknown target is refused before anything is written', () => {
  const dir = project()
  try {
    assert.throws(() => installSkill({ project: dir, target: 'nonsense' }), /unknown --target/)
    assert.equal(listFiles(dir).length, 0, 'something was written despite the bad target')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('nothing in the installed skill leaks this checkout path', () => {
  /* A local absolute path is useless to a consumer and discloses the author's filesystem. */
  const dir = project()
  try {
    installSkill({ project: dir, target: 'agents' })
    const root = join(dir, TARGET_DIRECTORIES.agents)
    const offenders = listFiles(root).filter((file) =>
      readFileSync(join(root, file), 'utf8').includes(process.cwd()),
    )
    assert.deepEqual(offenders, [])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the CLI still runs when its path crosses a symlink', () => {
  /* A naive "run or imported" check exits 0 doing nothing through a symlink (macOS /tmp, pnpm). */
  const here = dirname(fileURLToPath(import.meta.url))
  const dir = mkdtempSync(join(tmpdir(), 'kit-symlink-'))
  try {
    const link = join(dir, 'linked-scripts')
    symlinkSync(here, link, 'dir')
    const project = join(dir, 'project')
    mkdirSync(project, { recursive: true })

    execFileSync(process.execPath, [join(link, 'install-skill.mjs'), '--project=.'], {
      cwd: project, encoding: 'utf8',
    })
    assert.ok(
      existsSync(join(project, '.agents/skills/themelia-ui/SKILL.md')),
      'the CLI wrote nothing when reached through a symlink',
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the CLI has explicit help and rejects unknown arguments', () => {
  const script = fileURLToPath(new URL('./install-skill.mjs', import.meta.url))
  const help = execFileSync(process.execPath, [script, '--help'], { encoding: 'utf8' })
  assert.match(help, /--project/)
  assert.match(help, /--target/)
  assert.throws(
    () => execFileSync(process.execPath, [script, '--mystery=yes'], { encoding: 'utf8' }),
    /Command failed/,
  )
})
