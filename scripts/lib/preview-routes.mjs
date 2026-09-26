/*
 * Which preview route documents a family: the single implementation behind the manifest's
 * `documentationRoute` and the consumer docs. Routes come from src/preview/routes.json; a
 * route's URL is not its page's filename (`/header` is `layout-header.tsx`).
 */
import { existsSync, readFileSync } from 'node:fs'

export function previewRoutes() {
  const { routes } = JSON.parse(readFileSync('src/preview/routes.json', 'utf8'))
  const claims = new Map()
  for (const row of routes) {
    const file = `src/preview/pages/${row.page}.tsx`
    if (!existsSync(file)) continue
    const route = { path: row.path, label: row.label }
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
