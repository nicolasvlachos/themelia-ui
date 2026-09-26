/*
 * Which preview route documents a module: the single implementation behind the manifest's
 * `documentationRoute` and the consumer docs. Routes and the names each page imports come
 * from src/preview/routes.json; a route's URL is not its page's filename (`/header` is
 * `layout-header.tsx`).
 */
import { readFileSync } from 'node:fs'

import { runtimeNames } from './preview-pages.mjs'

export function previewRoutes() {
  const { routes } = JSON.parse(readFileSync('src/preview/routes.json', 'utf8'))
  const claims = new Map()
  for (const row of routes) {
    const route = { path: row.path, label: row.label }
    for (const entry of row.imports ?? []) {
      for (const name of runtimeNames(entry.names)) {
        if (!claims.has(name)) claims.set(name, route)
      }
    }
  }
  /** The first claimed symbol wins — a module's page is the page documenting its exports. */
  return (symbols) => symbols.map((s) => claims.get(s)).find(Boolean) ?? null
}
