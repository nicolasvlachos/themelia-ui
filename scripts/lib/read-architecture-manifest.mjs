/*
 * The one reader for architecture/manifest.json and the source-edge scan, shared by the
 * verifier, the Vite entries and the generators so they all agree on what it says.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import ts from 'typescript'

const PATH = 'architecture/manifest.json'

const walk = (dir, acc = []) => {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) walk(path, acc)
    else acc.push(path)
  }
  return acc
}

/*
 * A family's own source files: its barrel's directory, or just the file for a single-file
 * entry (the root `src/index.ts` would otherwise scan the whole package).
 */
function sourceFiles(family, allFamilies = []) {
  const dir = family.source.replace(/\/index\.ts$/, '')
  if (dir === 'src' || dir === family.source) return [family.source]

  /*
   * A nested entry (`features/rich-text-editor/tiptap`) owns its own files, so the parent's
   * dependency on it is recorded as an explicit edge.
   */
  const nested = allFamilies
    .map((other) => other.source.replace(/\/index\.ts$/, ''))
    .filter((other) => other !== dir && other.startsWith(`${dir}/`))
  /*
   * Tests are not published, so they are not edges. ui-provider's portal test opens a real
   * DropdownMenu: drop this filter and `verify architecture` fails.
   */
  return walk(dir).filter(
    (f) =>
      /\.tsx?$/.test(f) &&
      !/\.(test|spec)\.tsx?$/.test(f) &&
      !nested.some((other) => f.startsWith(`${other}/`)),
  )
}

/** Every import specifier a family names, bare and aliased alike. */
export function specifiers(family, allFamilies = []) {
  const out = new Set()
  for (const file of sourceFiles(family, allFamilies)) {
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/from\s+["']([^"']+)["']/g)) out.add(m[1])
    for (const m of text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) out.add(m[1])
  }
  return [...out]
}

/** Module references that survive compilation; types and examples in comments do not. */
function runtimeSpecifiers(file) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const out = new Set()
  const add = (node) => {
    if (node && ts.isStringLiteralLike(node)) out.add(node.text)
  }
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause
      const bindings = clause?.namedBindings
      const onlyTypes = clause?.isTypeOnly || (
        !clause?.name && bindings && ts.isNamedImports(bindings) &&
        bindings.elements.length > 0 && bindings.elements.every((item) => item.isTypeOnly)
      )
      if (!onlyTypes) add(node.moduleSpecifier)
    } else if (ts.isExportDeclaration(node)) {
      const clause = node.exportClause
      const onlyTypes = node.isTypeOnly || (
        clause && ts.isNamedExports(clause) && clause.elements.length > 0 &&
        clause.elements.every((item) => item.isTypeOnly)
      )
      if (!onlyTypes) add(node.moduleSpecifier)
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      add(node.arguments[0])
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return out
}

/** The runtime edges between component families, including exact nested entries. */
export function actualEdges(family, known, allFamilies = []) {
  // Foundation entries and layer barrels are outside the component-family layer graph.
  const owners = allFamilies
    .filter((other) => other.id.includes('/') && known.has(other.id))
    .map((other) => ({ id: other.id, dir: resolve(dirname(other.source)) }))
    .sort((a, b) => b.dir.length - a.dir.length)
  const aliases = [...known.keys()].filter((id) => id.includes('/'))
    .sort((a, b) => b.length - a.length)
  const out = new Set()
  for (const file of sourceFiles(family, allFamilies)) {
    for (const specifier of runtimeSpecifiers(file)) {
      let owner
      if (specifier.startsWith('@/components/')) {
        const path = specifier.slice('@/components/'.length)
        owner = aliases.find((id) => path === id || path.startsWith(`${id}/`))
      } else if (specifier.startsWith('.')) {
        const path = resolve(dirname(file), specifier)
        owner = owners.find(({ dir }) => path === dir || path.startsWith(`${dir}${sep}`))?.id
      }
      if (owner && owner !== family.id) out.add(owner)
    }
  }
  return out
}

/**
 * The layer graph. A layer may import from any layer listed for it, and from itself.
 * `typography` sits BELOW primitives (a `Value` renders `Text`), although its directory is
 * still under `base/`; the manifest records the target layer.
 */
export const ALLOWED_EDGES = {
  foundation: [],
  typography: ['foundation'],
  primitives: ['foundation', 'typography'],
  base: ['foundation', 'typography', 'primitives'],
  layout: ['foundation', 'typography', 'primitives', 'base'],
  features: ['foundation', 'typography', 'primitives', 'base'],
  patterns: ['foundation', 'typography', 'primitives', 'base', 'layout', 'features'],
  blocks: ['foundation', 'typography', 'primitives', 'base', 'patterns', 'layout', 'features'],
  admin: ['foundation', 'typography', 'primitives', 'base', 'patterns', 'layout', 'features'],
}

export function readManifest() {
  if (!existsSync(PATH)) {
    throw new Error(`${PATH} is missing — run \`node scripts/gen-architecture-manifest.mjs\``)
  }
  const manifest = JSON.parse(readFileSync(PATH, 'utf8'))
  const byId = new Map(manifest.families.map((family) => [family.id, family]))
  return {
    ...manifest,
    byId,
    /** `{ order }`: families in dependency order, or `{ cycle }` when the graph has one. */
    topological() {
      const seen = new Map()
      const order = []
      let cycle = null
      const visit = (id, trail) => {
        if (cycle) return
        if (seen.get(id) === 'done') return
        if (seen.get(id) === 'open') {
          cycle = [...trail.slice(trail.indexOf(id)), id]
          return
        }
        seen.set(id, 'open')
        for (const next of byId.get(id)?.dependsOnFamilies ?? []) visit(next, [...trail, id])
        seen.set(id, 'done')
        order.push(id)
      }
      for (const family of manifest.families) visit(family.id, [])
      return cycle ? { cycle } : { order }
    },
  }
}
