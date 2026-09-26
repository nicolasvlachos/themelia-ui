/*
 * Regenerates the consumer skill (.agents/skills/themelia-ui) from
 * docs/generated/component-index.json — run gen-consumer-docs first. Only the blocks between
 * GENERATED markers in SKILL.md are rewritten (a missing marker throws); the judgement
 * around them stays hand-written. Also copies the prose references, rewriting their links.
 * The per-module API references and the component index are not copied: they ship in the
 * package under docs/generated, and the skill names them there.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'

import { TIERS } from './lib/tiers.mjs'

/* The skill ships in the package; `install-skill` copies it into a consumer's project. */
const SKILL = '.agents/skills/themelia-ui'

const writeSkill = (relative, text) => {
  const target = `${SKILL}/${relative}`
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, text)
}
const index = JSON.parse(readFileSync('docs/generated/component-index.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const records = Object.values(index.modules)
const name = index.package ?? 'themelia-ui'
const skillName = name.replace(/^@/, '').replaceAll('/', '-')

/* One row per tier, counted from the records rather than from memory. */
const BLURB = {
  foundations: 'the provider, the form contract and the theming helpers',
  primitives: 'one formatted value, no interaction — Money, Date, Email',
  base: 'one generic concept: text roles, controls, rows, passive structure',
  layout: 'page and application shells',
  features: 'an owned interaction lifecycle — a context, a hook, a state machine',
  blocks: 'an arrangement rendering a subject; the admin blocks make up the admin profile',
}

const tiers = ['| tier | modules | what lives there | example import |', '| --- | --- | --- | --- |']
for (const tier of TIERS) {
  const list = records.filter((record) => record.tier === tier.id)
  if (!list.length) continue
  const example = list.find((r) => r.components?.length) ?? list[0]
  tiers.push(`| ${tier.label} (\`${tier.id}\`) | ${list.length} | ${BLURB[tier.id]} | \`${example.import}\` |`)
}
const totalComponents = records.reduce((n, r) => n + (r.components?.length ?? 0), 0)
tiers.push(
  '',
  `${records.length} modules, ${totalComponents} public components, ` +
    `${records.reduce((n, r) => n + r.symbols.length, 0)} exported symbols in total.`,
)

const withCss = records.filter((r) => r.css).length
const delivery = [
  '```tsx compile',
  `import { Button } from "${name}/base/buttons"`,
  `import "${name}/base/buttons.css"`,
  '```',
  '',
  '**The JavaScript imports no CSS.** A component whose module stylesheet is not imported',
  'renders unstyled.',
  '',
  `**The stylesheet is split per module.** ${withCss} of ${records.length} modules ship one;` +
    ' a module whose components draw nothing has none. Each module stylesheet imports',
  '`core.css` itself, so the tokens, themes, and cascade layer order arrive automatically.',
  'Import `core.css` on its own only when application CSS needs the token contract before',
  'any component stylesheet is loaded.',
  '',
  `\`${name}/style.css\` is the deduplicated union of every sheet, for a consumer who would`,
  'rather not track them. It is larger than what any one application uses.',
  '',
  'Import consumer overrides after the kit. Its component rules are layered, so ordinary',
  'unlayered app CSS wins without specificity tricks.',
]

/* Optional-peer ownership is an API fact, so the manifest owns this table too. */
const peerFamilies = new Map()
for (const record of records) {
  for (const peer of record.optionalPeers) {
    if (!peerFamilies.has(peer)) peerFamilies.set(peer, [])
    peerFamilies.get(peer).push(record.id)
  }
}
const peers = [
  `There are ${peerFamilies.size} optional peer packages. A consumer only needs the peers ` +
    'reachable from the exact module subpaths it imports; release verification checks that boundary.',
  '',
  '| peer | reachable only from |',
  '| --- | --- |',
  ...[...peerFamilies]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([peer, families]) =>
        `| \`${peer}\` | ${families.map((family) => `\`${family}\``).join(', ')} |`,
    ),
]

/* The search paragraph: generated because it carries counts, which only markers keep true. */
const previewCount = new Set(
  records.flatMap((record) => (record.previews ?? []).map((preview) => preview.route)),
).size
const recipeCount = new Set(
  records.flatMap((record) =>
    (record.recipes ?? []).map((recipe) => `${recipe.route}\u0000${recipe.id}`),
  ),
).size
const search = [
  'Do not guess a component name, and do not fall back to a `<div>` because nothing obvious',
  'came to mind. Ask:',
  '',
  '```bash',
  `node node_modules/${name}/scripts/consumer/find-component.mjs "key value facts"`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --tier=primitives --json`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --tier=base --limit=20`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --module=features/data-view`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --peer=@tanstack/react-table`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --help`,
  '```',
  '',
  `It indexes ${records.length} modules, ${recipeCount} attributed live recipes, and`,
  `${previewCount} live preview routes by public symbol, module id, recipe title, preview route,`,
  'component capabilities, descriptions, and positive selection guidance. Negative `avoidWhen` guidance is never treated as a',
  'recommendation. `--json` includes the exact',
  '`publicImport`, `cssImport`, `apiDoc`, optional peers, dependencies, and alternatives.',
  'Use `--explain` to see matched components and why they fit. Component guidance identifies',
  'curated decisions separately from module-level fallback; missing prop defaults are not inferred.',
]

/* What the root is and which broad barrels are published, derived from package.json exports. */
const BROAD = ['./base', './features', './patterns', './layout', './admin']
const publishedBroad = BROAD.filter((path) => path in (pkg.exports ?? {}))

const root = publishedBroad.length === 0
  ? [
      '**There are no broad aggregate barrels.** `themelia-ui/base` and',
      '`themelia-ui/features` are not published — an import of either fails to resolve.',
      'Every module has one exact subpath, which is what keeps an optional peer reachable only',
      'from the module that needs it.',
      '',
      'The root, `themelia-ui`, is the provider plus the primitives, and it is',
      'optional-peer-free: a consumer who imports it installs no recharts, no table, no',
      'leaflet. Reach for a module by its own subpath and the question never comes up.',
    ]
  : [
      `**These broad barrels are published: ${publishedBroad.map((p) => `\`themelia-ui${p.slice(1)}\``).join(', ')}.**`,
      'A barrel re-exports everything, so importing one reaches every optional peer beneath it',
      'and requires them all installed. Import the narrow subpath instead.',
    ]

/* The one reference-table row that carries a count (index records exclude the root entry). */
const indexRow = [
  `| \`node_modules/${name}/docs/generated/component-index.json\` | choosing a component. ` +
    `${records.length} modules with \`import\`, \`symbols\`, and the \`chooseWhen\` / \`avoidWhen\` / ` +
    '`alternatives` that say which one to reach for. The machine surface: search it with ' +
    '`find-component.mjs` rather than reading it whole. |',
]

/* Rewrite only what sits between the markers. */
let skill = readFileSync(`${SKILL}/SKILL.md`, 'utf8')
skill = skill.replace(/^name:.*$/m, `name: ${skillName}`)
for (const [marker, body] of [['tiers', tiers], ['delivery', delivery], ['peers', peers], ['search', search], ['root', root], ['index-row', indexRow]]) {
  const open = `<!-- GENERATED:${marker} by scripts/gen-agent-skill.mjs — do not edit between these markers. -->`
  const close = `<!-- /GENERATED:${marker} -->`
  const from = skill.indexOf(open)
  const to = skill.indexOf(close)
  if (from === -1 || to === -1) throw new Error(`SKILL.md is missing the ${marker} markers`)
  skill = skill.slice(0, from + open.length) + '\n' + body.join('\n') + '\n' + skill.slice(to)
}
/*
 * The marker `install-skill.mjs` trusts to overwrite a destination on upgrade. Placed after
 * the frontmatter: a comment above `---` stops it being frontmatter.
 */
const MARKER = '<!-- GENERATED by themelia-ui/scripts/gen-agent-skill.mjs -->'
if (!skill.includes(MARKER)) {
  const afterFrontmatter = skill.indexOf('\n---\n', 3)
  if (afterFrontmatter === -1) throw new Error('SKILL.md has no frontmatter to place the marker after')
  const at = afterFrontmatter + '\n---\n'.length
  skill = `${skill.slice(0, at)}\n${MARKER}${skill.slice(at)}`
}

writeSkill('SKILL.md', skill)

/* references/imports.md — the same table the human docs get. */
writeSkill('references/imports.md', readFileSync('docs/generated/imports.md', 'utf8'))

/*
 * Prose references copied verbatim (not linked, not summarised): the skill is read in a
 * consuming app with no checkout of this repository.
 */
const PROSE = {
  'installation.md': 'docs/learn/installation.md',
  'theming.md': 'docs/learn/theming.md',
  'provider-and-scoping.md': 'docs/learn/provider-and-scoping.md',
  'composition.md': 'docs/learn/composition.md',
  'framework-wiring.md': 'docs/learn/framework-wiring.md',
  'forms.md': 'docs/learn/forms.md',
  'i18n.md': 'docs/learn/i18n.md',
  'migration.md': 'docs/learn/migration.md',
  'api-compatibility.md': 'docs/learn/api-compatibility.md',
  'troubleshooting.md': 'docs/learn/troubleshooting.md',
  'verification.md': 'docs/learn/verification.md',
  'composition-ladder.md': 'docs/generated/composition-ladder.md',
}

/* Remove references retired from the generated skill so upgrades cannot retain stale prose. */
const referenceMarkdown = new Set(['imports.md', ...Object.keys(PROSE)])
for (const base of [SKILL]) {
  const directory = `${base}/references`
  if (!existsSync(directory)) continue
  for (const file of readdirSync(directory)) {
    if (file.endsWith('.md') && !referenceMarkdown.has(file)) rmSync(`${directory}/${file}`)
  }
}

/*
 * Relative links are resolved against their source document, then mapped: to a shipped
 * reference, to a published file under node_modules, or else reduced to their text.
 * Resolve full paths, never bare file names (two different `migration.md` files exist).
 */
const SHIPPED_FROM = new Map([
  ...Object.entries(PROSE).map(([target, source]) => [source, target]),
  ['docs/generated/imports.md', 'imports.md'],
])

/* What package.json `files` publishes — keep in step with it. */
const PUBLISHED_FILES = new Set(['README.md', 'CHANGELOG.md', 'SECURITY.md', 'docs/README.md', 'src/styles/TOKENS.md', 'src/styles/FACTORS.md', 'src/styles/SCOPES.md'])
const isPublished = (path) => PUBLISHED_FILES.has(path) || /^docs\/(?:learn|generated|build)\//.test(path)

function rewriteLinks(markdown, source) {
  return markdown.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label, target) => {
    if (/^(https?:|#|mailto:)/.test(target)) return whole
    const [path, anchor] = target.split('#')
    const hash = anchor ? `#${anchor}` : ''
    const resolved = normalize(join(dirname(source), path))
    if (SHIPPED_FROM.has(resolved)) return `[${label}](${SHIPPED_FROM.get(resolved)}${hash})`
    if (isPublished(resolved) && existsSync(resolved)) return `${label} (\`node_modules/${name}/${resolved}\`)`
    return label
  })
}

for (const [target, source] of Object.entries(PROSE)) {
  writeSkill(`references/${target}`, rewriteLinks(readFileSync(source, 'utf8'), source))
}

/* The per-module references and the index ship under docs/generated; drop any old copies. */
rmSync(`${SKILL}/references/components`, { recursive: true, force: true })

console.log(`agent skill: ${records.length} modules into SKILL.md and references/imports.md`)
