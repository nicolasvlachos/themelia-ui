/*
 * Each documented page from src/preview/routes.json, the page table: one record per import
 * line a page shows, with the page's name, summary, route and search keywords. Shared by
 * gen-gallery and verify-docs-coverage. Pages about a concept, with no `imports`, are left out.
 */
import { readFileSync } from 'node:fs'

export function previewPages() {
  const { routes } = JSON.parse(readFileSync('src/preview/routes.json', 'utf8'))
  return routes.flatMap((route) =>
    /* A merged page's further imports each become their own card and search hit, routed to it. */
    (route.imports ?? []).map((entry) => ({
      title: entry.title ?? route.label,
      summary: route.summary ?? null,
      exports: entry.names,
      subpath: entry.from,
      preview: route.path,
      keywords: route.keywords ?? [],
    })),
  )
}

/** The runtime names an import line documents: `type` entries are left out. */
export const runtimeNames = (names) => names.filter((name) => /^[A-Za-z0-9]+$/.test(name))
