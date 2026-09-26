/*
 * Reads each preview page's `<ComponentPage>` props (title, summary, importPath, exports,
 * alsoImports) and its route, shared by `find-component` and `gen-gallery`.
 * Parses routes.ts and the page tags by regex: keep their formats (see the patterns below).
 */
import { readFileSync, readdirSync } from 'node:fs'

const PAGES = 'src/preview/pages'

const list = (raw) => [...raw.matchAll(/"([^"]+)"/g)].map((match) => match[1])

/**
 * Every documented page, with its route from the route table (not the filename:
 * `overview.tsx` serves `/`). Prose pages without an `importPath` are left out.
 */
export function previewPages(packageName) {
  const routeSource = readFileSync('src/preview/routes.ts', 'utf8')

  const keywordsByPath = new Map()
  for (const row of routeSource.matchAll(/\{\s*path:\s*"([^"]+)",[^}]*?keywords:\s*\[([^\]]*)\]/g)) {
    keywordsByPath.set(row[1], list(row[2]))
  }

  /* component name → the path it is routed at */
  const pathByComponent = new Map()
  for (const row of routeSource.matchAll(/\{\s*path:\s*"([^"]+)"[^}]*?component:\s*(\w+)/g)) {
    pathByComponent.set(row[2], row[1])
  }

  const pages = []
  for (const file of readdirSync(PAGES)) {
    if (!file.endsWith('.tsx')) continue
    const source = readFileSync(`${PAGES}/${file}`, 'utf8')

    /* Only the `<ComponentPage …>` tag: sample components further down have their own `title=`. */
    const header = source.match(/<ComponentPage[\s\S]*?\n\t*>/)?.[0] ?? source

    const importPath = header.match(/importPath="([^"]+)"/)?.[1]
    const exportsRaw = header.match(/exports=\{\[([\s\S]*?)\]\}/)?.[1]
    if (!importPath || !exportsRaw) continue

    const componentName = source.match(/export function (\w+Page)\b/)?.[1]
    const route = (componentName && pathByComponent.get(componentName)) ?? `/${file.replace(/\.tsx$/, '')}`

    const toSubpath = (path) =>
      path.replace('@/components/', `${packageName}/`).replace('@/lib/', `${packageName}/`)
    const title = header.match(/title="([^"]+)"/)?.[1] ?? route.slice(1)
    const summary = header.match(/summary="([^"]+)"/)?.[1] ?? null

    pages.push({
      title,
      summary,
      exports: list(exportsRaw),
      internal: importPath,
      subpath: toSubpath(importPath),
      preview: route,
      keywords: keywordsByPath.get(route) ?? [],
    })

    /*
     * A merged page's `alsoImports` entries each become their own card and search hit,
     * routed to the merged page, so a folded-in family stays findable.
     */
    const alsoRaw = header.match(/alsoImports=\{\[([\s\S]*?)\]\}\n/)?.[1] ?? ''
    for (const entry of alsoRaw.matchAll(/\{\s*importPath:\s*"([^"]+)",(?:\s*title:\s*"([^"]+)",)?\s*exports:\s*\[([\s\S]*?)\]\s*\}/g)) {
      pages.push({
        title: entry[2] ?? title,
        summary,
        exports: list(entry[3]),
        internal: entry[1],
        subpath: toSubpath(entry[1]),
        preview: route,
        keywords: keywordsByPath.get(route) ?? [],
      })
    }
  }

  return pages
}
