/*
 * Every public component (PascalCase or `use*` runtime export) is listed in some preview page's
 * `exports={[…]}` or `alsoImports`, and every page's import path is a published subpath.
 * A coverage rule as much as a docs rule: the visual and fault suites only walk preview pages.
 * The fix for a miss is a prop-table row, not just a name. Type-only exports and lowercase
 * helpers are exempt.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'

const MANIFEST = JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))
import { starTargets } from './lib/public-symbols.mjs'

/* Manifest layer names, not directories: `typography` lives at src/components/base/typography. */
const LAYERS = ['base', 'features', 'layout', 'patterns', 'admin', 'primitives', 'typography']

/* Foundation families live outside `src/components/`. `src/index.ts` is left out: it
 * re-exports the other families and would count every component twice. */
const FOUNDATION = ['src/lib/forms/index.ts', 'src/lib/forms-rhf/index.ts', 'src/lib/ui-provider/index.ts']

/* Every name any page claims to document. */
const documented = new Set()
for (const file of readdirSync('src/preview/pages')) {
  const text = readFileSync(`src/preview/pages/${file}`, 'utf8')
  for (const block of text.matchAll(/exports=\{\[([\s\S]*?)\]\}/g)) {
    for (const name of block[1].matchAll(/"([A-Za-z0-9]+)"/g)) documented.add(name[1])
  }
  /* A merged page's further import lines — `alsoImports={[{ …, exports: [ … ] }]}`. */
  for (const block of text.matchAll(/alsoImports=\{\[[\s\S]*?\]\}\n/g)) {
    for (const list of block[0].matchAll(/exports:\s*\[([\s\S]*?)\]/g)) {
      for (const name of list[1].matchAll(/"([A-Za-z0-9]+)"/g)) documented.add(name[1])
    }
  }
}

/*
 * Components and hooks from an index's `export { … }` blocks, following `export *` to its
 * file (families that re-export one implementation file would otherwise export nothing).
 * Entries prefixed `type` are dropped, leaving the runtime surface.
 */
function exported(indexPath) {
  const text = readFileSync(indexPath, 'utf8')
  const names = new Set()
  const sources = [text, ...starTargets(indexPath, text).map((file) => readFileSync(file, 'utf8'))]
  for (const block of sources.join('\n').matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (const raw of block[1].split(',')) {
      const entry = raw.trim()
      if (!entry || entry.startsWith('type ')) continue
      const name = (entry.split(/\s+as\s+/).pop() ?? entry).trim()
      if (/^[A-Z][A-Za-z0-9]*$/.test(name) || /^use[A-Z]/.test(name)) names.add(name)
    }
  }
  for (const file of starTargets(indexPath, text)) {
    for (const match of readFileSync(file, 'utf8').matchAll(/^export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z][\w]*)/gm)) {
      if (/^[A-Z]/.test(match[1]) || /^use[A-Z]/.test(match[1])) names.add(match[1])
    }
  }
  return names
}

const missing = []
let total = 0
for (const layer of LAYERS) {
  /* The manifest says which entries exist; a directory walk misses nested subpaths such as
   * `features/rich-text-editor/tiptap`. */
  const indexes = MANIFEST.families
    .filter((family) => family.layer === layer)
    .map((family) => family.source)
    .filter(existsSync)
  if (indexes.length === 0) throw new Error(`verify docs-coverage — no manifest family has layer "${layer}"`)

  for (const index of indexes) {
    for (const name of exported(index)) {
      total++
      if (!documented.has(name)) missing.push(`${index.replace('src/components/', '')}  ${name}`)
    }
  }
}

for (const index of FOUNDATION.filter(existsSync)) {
  for (const name of exported(index)) {
    total++
    if (!documented.has(name)) missing.push(`${index.replace('src/', '')}  ${name}`)
  }
}

if (missing.length) {
  console.error(`FAIL verify docs-coverage — ${missing.length} public component(s) on no preview page\n`)
  for (const line of missing.sort()) console.error(`  ${line}`)
  console.error(
    '\n  Add the name to that family\'s page `exports={[…]}` AND a row describing it.' +
      '\n  A component with no page is a component the visual and fault suites never walk.',
  )
  process.exit(1)
}

/* Every documented import path is a published subpath: it is what a consumer copies. */
{
  const { previewPages } = await import('./lib/preview-pages.mjs')
  const exportsMap = JSON.parse(readFileSync('package.json', 'utf8')).exports
  const name = JSON.parse(readFileSync('package.json', 'utf8')).name
  const unpublished = []

  for (const page of previewPages(name)) {
    const subpath = page.subpath.replace(name, '.')
    if (subpath in exportsMap) continue
    unpublished.push(
      `unpublished-import  ${page.preview} advertises \`${page.subpath}\`, which is not a published subpath`,
    )
  }

  if (unpublished.length) {
    console.error(`FAIL verify docs-coverage — ${unpublished.length} unpublished import path(s)\n`)
    for (const failure of unpublished) console.error(`  ${failure}`)
    process.exit(1)
  }
}

console.log(
  `PASS verify docs-coverage — ${total} public components across ${LAYERS.length} layers ` +
    `and ${FOUNDATION.length} foundation subpaths, every one on a preview page.`,
)
