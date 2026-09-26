/*
 * Regenerates the consumer skill (.agents/skills/themelia-ui) from
 * docs/generated/component-index.json — run gen-consumer-docs first. Only the blocks between
 * GENERATED markers in SKILL.md are rewritten (a missing marker throws); the judgement
 * around them stays hand-written. Also copies the prose references, rewriting their links.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'

/* The skill ships in the package; `install-skill` copies it into a consumer's project. */
const SKILL = '.agents/skills/themelia-ui'

const writeSkill = (relative, text) => {
  const target = `${SKILL}/${relative}`
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, text)
}
const index = JSON.parse(readFileSync('docs/generated/component-index.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const records = Object.values(index.families)
const name = index.package ?? 'themelia-ui'
const skillName = name.replace(/^@/, '').replaceAll('/', '-')

/* One row per layer, counted from the records rather than from memory. */
const ORDER = ['typography', 'primitives', 'base', 'layout', 'features', 'patterns', 'admin', 'foundation']
const BLURB = {
  typography: 'text in a role — Text, Heading, Label, TextLink',
  primitives: 'one formatted value, no interaction — Money, Date, Email',
  base: 'one generic concept: controls, rows, passive structure',
  layout: 'page and application shells',
  features: 'an owned interaction lifecycle — a context, a hook, a state machine',
  patterns: 'an arrangement rendering a subject',
  admin: 'the admin profile, built only on general families',
  foundation: 'the provider, the form contract, the root export',
}

const byLayer = new Map()
for (const record of records) {
  if (!byLayer.has(record.layer)) byLayer.set(record.layer, [])
  byLayer.get(record.layer).push(record)
}

const layers = ['| layer | families | what lives there | example import |', '| --- | --- | --- | --- |']
for (const layer of ORDER) {
  const list = byLayer.get(layer)
  if (!list?.length) continue
  const example = list.find((r) => r.components?.length) ?? list[0]
  layers.push(`| \`${layer}\` | ${list.length} | ${BLURB[layer] ?? ''} | \`${example.import}\` |`)
}
const totalComponents = records.reduce((n, r) => n + (r.components?.length ?? 0), 0)
layers.push(
  '',
  `${records.length} families, ${totalComponents} public components, ` +
    `${records.reduce((n, r) => n + r.symbols.length, 0)} exported symbols in total.`,
)

const withCss = records.filter((r) => r.css).length
const delivery = [
  '```tsx compile',
  `import { Button } from "${name}/base/buttons"`,
  `import "${name}/base/buttons.css"`,
  '```',
  '',
  `**The stylesheet is split per family.** ${withCss} of ${records.length} families ship one;` +
    ' a family whose components draw nothing has none. Each family stylesheet imports',
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
    'reachable from the exact family subpaths it imports; release verification checks that boundary.',
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
  `node node_modules/${name}/scripts/consumer/find-component.mjs --layer=primitives --json`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --layer=base --limit=20`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --family=features/data-view`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --peer=@tanstack/react-table`,
  `node node_modules/${name}/scripts/consumer/find-component.mjs --help`,
  '```',
  '',
  `It indexes ${records.length} component families, ${recipeCount} attributed live recipes, and`,
  `${previewCount} live preview routes by public symbol, family id, recipe title, preview route,`,
  'component capabilities, descriptions, and positive selection guidance. Negative `avoidWhen` guidance is never treated as a',
  'recommendation. `--json` includes the exact',
  '`publicImport`, `cssImport`, `apiDoc`, optional peers, dependencies, and alternatives.',
  'Use `--explain` to see matched components and why they fit. Component guidance identifies',
  'curated decisions separately from family-level fallback; missing prop defaults are not inferred.',
]

/* What the root is and which broad barrels are published, derived from package.json exports. */
const BROAD = ['./base', './features', './patterns', './layout', './admin']
const publishedBroad = BROAD.filter((path) => path in (pkg.exports ?? {}))

const root = publishedBroad.length === 0
  ? [
      '**There are no broad aggregate barrels.** `themelia-ui/base` and',
      '`themelia-ui/features` are not published — an import of either fails to resolve.',
      'Every family has one exact subpath, which is what keeps an optional peer reachable only',
      'from the family that needs it.',
      '',
      'The root, `themelia-ui`, is the provider plus the primitives, and it is',
      'optional-peer-free: a consumer who imports it installs no recharts, no table, no',
      'leaflet. Reach for a family by its own subpath and the question never comes up.',
    ]
  : [
      `**These broad barrels are published: ${publishedBroad.map((p) => `\`themelia-ui${p.slice(1)}\``).join(', ')}.**`,
      'A barrel re-exports everything, so importing one reaches every optional peer beneath it',
      'and requires them all installed. Import the narrow subpath instead.',
    ]

/* The one reference-table row that carries a count (index records exclude the root entry). */
const indexRow = [
  `| \`references/components/INDEX.json\` | choosing a component. ${records.length} families with ` +
    '`publicImport`, `publicSymbols`, and the `chooseWhen` / `avoidWhen` / `alternatives` that ' +
    'say which one to reach for. The machine surface — filter it, do not read it. |',
]

/* Rewrite only what sits between the markers. */
let skill = readFileSync(`${SKILL}/SKILL.md`, 'utf8')
skill = skill.replace(/^name:.*$/m, `name: ${skillName}`)
for (const [marker, body] of [['layers', layers], ['delivery', delivery], ['peers', peers], ['search', search], ['root', root], ['index-row', indexRow]]) {
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
  ['docs/generated/components/INDEX.md', 'components/INDEX.md'],
  ['docs/generated/components/INDEX.json', 'components/INDEX.json'],
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
    const component = resolved.match(/^docs\/generated\/components\/([^/]+\.md)$/)
    if (component) return `[${label}](components/${component[1]}${hash})`
    if (isPublished(resolved) && existsSync(resolved)) return `${label} (\`node_modules/${name}/${resolved}\`)`
    return label
  })
}

for (const [target, source] of Object.entries(PROSE)) {
  writeSkill(`references/${target}`, rewriteLinks(readFileSync(source, 'utf8'), source))
}

/* Per-family API references are copied whole for progressive disclosure. */
for (const base of [SKILL]) {
  const directory = `${base}/references/components`
  if (!existsSync(directory)) continue
  for (const file of readdirSync(directory).filter((file) => file.endsWith('.md'))) {
    rmSync(`${directory}/${file}`)
  }
}
for (const file of readdirSync('docs/generated/components').filter((file) => file.endsWith('.md'))) {
  /* The component subtree is copied without moving, so its internal relative links stay valid. */
  writeSkill(`references/components/${file}`, readFileSync(`docs/generated/components/${file}`, 'utf8'))
}

/* INDEX.json — the machine discovery surface SKILL.md tells agents to filter. */
writeSkill(
  'references/components/INDEX.json',
  `${JSON.stringify(
    {
      note:
        'Generated by scripts/gen-agent-skill.mjs from docs/generated/component-index.json — ' +
        'the same records the human documentation reads. Filter by layer, profile, family or ' +
        'symbol. chooseWhen/avoidWhen/alternatives are the selection guidance; alternatives ' +
        'name family ids, never symbols.',
      schemaVersion: index.schemaVersion,
      packageVersion: index.packageVersion,
      package: name,
      families: records.map((r) => ({
        family: r.id,
        layer: r.layer,
        profile: r.profile,
        status: r.status,
        publicImport: r.import,
        cssImport: r.css,
        publicSymbols: r.symbols,
        components: r.components,
        componentGuidance: r.componentGuidance,
        doc: r.documentation,
        apiDoc: r.apiDoc,
        chooseWhen: r.chooseWhen ?? null,
        avoidWhen: r.avoidWhen ?? null,
        alternatives: r.alternatives ?? [],
        composeWith: r.composeWith ?? [],
        optionalPeers: r.optionalPeers,
        dependsOnFamilies: r.dependsOnFamilies,
        previews: r.previews ?? [],
        recipes: r.recipes ?? [],
      })),
    },
    null,
    2,
  )}\n`,
)

console.log(
  `agent skill: ${records.length} families into SKILL.md, references/imports.md and ` +
    'references/components/INDEX.json',
)
