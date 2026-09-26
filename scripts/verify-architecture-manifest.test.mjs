/*
 * Proves the architecture gate fails on the defects it claims to catch.
 * Each case writes a mutated manifest over architecture/manifest.json, runs the verifier and
 * asserts on the rule id; the original is backed up and renamed back in `finally`.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, readFileSync, renameSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'

const PATH = 'architecture/manifest.json'
const BACKUP = 'architecture/.manifest.backup.json'

const run = () => {
  try {
    execFileSync('node', ['scripts/verify-architecture-manifest.mjs'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { failed: false, out: '' }
  } catch (error) {
    return { failed: true, out: `${error.stdout ?? ''}${error.stderr ?? ''}` }
  }
}

const cases = [
  /* ── judgement: the hand-edited fields, where a typo lands ── */
  {
    rule: 'judgement',
    expect: () => ['judgement', 'base/badge', '"stabel"'],
    mutate: (m) => {
      m.families.find((f) => f.id === 'base/badge').status = 'stabel'
      return 'base/badge misspells its status'
    },
  },
  {
    rule: 'judgement',
    expect: () => ['judgement', 'base/badge', '"sortOrder"'],
    mutate: (m) => {
      m.families.find((f) => f.id === 'base/badge').sortOrder = 3
      return 'base/badge grows a key regeneration would drop'
    },
  },
  {
    rule: 'judgement',
    expect: () => ['judgement', '"generatedAt"'],
    mutate: (m) => {
      m.generatedAt = '2026-09-04'
      return 'the manifest grows an undeclared top-level key'
    },
  },
  {
    rule: 'judgement',
    expect: () => ['judgement', 'base/badge', 'root-relative'],
    mutate: (m) => {
      const family = m.families.find((f) => f.id === 'base/badge')
      family.documentationRoute = { ...family.documentationRoute, path: family.documentationRoute.path.replace(/^\//, '') }
      return 'base/badge documents a route with no leading slash'
    },
  },
  {
    rule: 'unowned-peer',
    expect: () => ['unowned-peer', 'recharts'],
    mutate: (m) => {
      for (const family of m.families) family.optionalPeers = family.optionalPeers.filter((peer) => peer !== 'recharts')
      return 'no family records recharts, which package.json still declares'
    },
  },
  {
    rule: 'undeclared-edge',
    mutate: (m) => {
      const family = m.families.find((f) => f.dependsOnFamilies.length > 0)
      family.dependsOnFamilies = []
      return `${family.id} has its edges erased`
    },
  },
  {
    rule: 'stale-edge',
    mutate: (m) => {
      const family = m.families.find((f) => f.id.startsWith('base/'))
      family.dependsOnFamilies = [...family.dependsOnFamilies, 'base/badge']
      return `${family.id} declares an edge it does not have`
    },
  },
  {
    rule: 'cycle',
    mutate: (m) => {
      /* Two families pointing at each other — builds today, deadlocks in CJS. */
      const [a, b] = ['base/badge', 'base/buttons'].map((id) => m.families.find((f) => f.id === id))
      a.dependsOnFamilies = [...new Set([...a.dependsOnFamilies, b.id])]
      b.dependsOnFamilies = [...new Set([...b.dependsOnFamilies, a.id])]
      return 'base/badge and base/buttons import each other'
    },
  },
  {
    rule: 'peer-drift',
    mutate: (m) => {
      const family = m.families.find((f) => f.optionalPeers.length > 0)
      const dropped = family.optionalPeers.pop()
      return `${family.id} stops recording ${dropped}`
    },
  },
  {
    rule: 'unaccounted',
    mutate: (m) => {
      m.families = m.families.filter((f) => f.id !== 'base/badge')
      return 'base/badge is published but removed from the manifest'
    },
  },
  {
    rule: 'orphan',
    mutate: (m) => {
      m.families.find((f) => f.id === 'base/badge').export = './base/not-published'
      return 'a family claims a subpath the package does not publish'
    },
  },
  {
    rule: 'barrel-import',
    mutate: (m) => {
      const family = m.families.find((f) => f.id === 'base/badge')
      family.source = 'scripts/fixtures/architecture-barrel-import/index.ts'
      return 'a base family imports the bare @/components/layout barrel'
    },
  },
  {
    rule: 'profile-edge',
    mutate: (m) => {
      const general = m.families.find((f) => f.id === 'base/badge')
      const admin = m.families.find((f) => f.profile === 'admin')
      general.dependsOnFamilies = [...general.dependsOnFamilies, admin.id]
      return `general ${general.id} depends on admin ${admin.id}`
    },
  },
]

/*
 * The baseline runs BEFORE the backup exists: `process.exit` skips `finally`, so exiting
 * after the copy would leave `.manifest.backup.json` in the tree.
 */
if (run().failed) {
  console.log('FAIL — the committed manifest does not pass; fix that before trusting this test')
  process.exit(1)
}

copyFileSync(PATH, BACKUP)
let failures = 0
try {
  for (const testCase of cases) {
    const manifest = JSON.parse(readFileSync(BACKUP, 'utf8'))
    const description = testCase.mutate(manifest)
    writeFileSync(PATH, JSON.stringify(manifest, null, 2))
    const result = run()
    /*
     * `expect` reads the MUTATED manifest (pointer indices are only known after mutating).
     * Every needle must appear, so an unrelated failure naming the rule cannot pass a case.
     */
    const needles = testCase.expect ? testCase.expect(manifest) : [testCase.rule]
    const missing = result.failed ? needles.filter((needle) => !result.out.includes(needle)) : needles
    const caught = result.failed && missing.length === 0
    console.log(`  ${caught ? 'caught ' : 'MISSED '} ${testCase.rule.padEnd(17)} ${description}`)
    if (!caught) {
      console.log(`            ${result.failed ? `did not say: ${missing.join(', ')}` : 'the verifier passed'}`)
      failures++
    }
  }
} finally {
  renameSync(BACKUP, PATH)
  if (existsSync(BACKUP)) unlinkSync(BACKUP)
}

if (failures) {
  console.log(`\nFAIL verify architecture self-test — ${failures} rule(s) did not fire`)
  process.exit(1)
}
console.log(`\nPASS verify architecture self-test — all ${cases.length} rules fire on their own defect.`)
