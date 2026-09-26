/*
 * Which preview route documents a family: the single implementation behind the manifest's
 * `documentationRoute` and the consumer docs. A route's URL is not its page's filename
 * (`/header` is `layout-header.tsx`): routes.ts names the component, its import names the
 * file. Parsed by regex — keep the `path:, label:, component:` row order and import shape.
 */
import { existsSync, readFileSync } from 'node:fs'

export function previewRoutes() {
  const routes = readFileSync('src/preview/routes.ts', 'utf8')
  const fileOf = new Map()
  for (const match of routes.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*"\.\/pages\/([\w-]+)"/g)) {
    fileOf.set(match[1], `src/preview/pages/${match[2]}.tsx`)
  }
  const claims = new Map()
  for (const match of routes.matchAll(/path:\s*"(\/[\w-]*)",\s*label:\s*"([^"]*)",\s*component:\s*(\w+)/g)) {
    const file = fileOf.get(match[3])
    if (!file || !existsSync(file)) continue
    const route = { path: match[1], label: match[2] }
    const source = readFileSync(file, 'utf8')
    for (const block of source.matchAll(/exports=\{\[([\s\S]*?)\]\}/g)) {
      for (const symbol of block[1].matchAll(/"([A-Za-z0-9]+)"/g)) {
        if (!claims.has(symbol[1])) claims.set(symbol[1], route)
      }
    }
    /* A merged page's further families: `alsoImports={[{ …, exports: [ … ] }]}`. */
    for (const block of source.matchAll(/alsoImports=\{\[[\s\S]*?\]\}\n/g)) {
      for (const list of block[0].matchAll(/exports:\s*\[([\s\S]*?)\]/g)) {
        for (const symbol of list[1].matchAll(/"([A-Za-z0-9]+)"/g)) {
          if (!claims.has(symbol[1])) claims.set(symbol[1], route)
        }
      }
    }
  }
  /** The first claimed symbol wins — a family's page is the page documenting its exports. */
  return (symbols) => symbols.map((s) => claims.get(s)).find(Boolean) ?? null
}
