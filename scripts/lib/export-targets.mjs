/*
 * The single reader of package.json exports entries (`{ types, default }`, or a string for a
 * stylesheet or data file). Scripts read entries through here instead of reaching for keys, so
 * a shape change has one place to land.
 *
 * Modules are published through subpath patterns (`"./base/*": { … "./dist/base/*.js" }`).
 * `expandExports` turns each module pattern into the exact subpaths the build emitted, so a
 * script can go on listing, counting and checking subpaths one by one. A pattern whose target
 * is a directory (`./styles/*`) stays a pattern.
 */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Every file an entry points at, flattened, with wildcards left in. */
export function targetPaths(value) {
  if (typeof value === 'string') return [value]
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap((nested) => targetPaths(nested))
}

/** The declaration file a consumer resolves for an entry; null for a stylesheet or data file. */
export function typesFor(value) {
  return typeof value?.types === 'string' ? value.types : null
}

/** The file a runtime resolves for an entry: `default` for a module, the string itself for a file. */
function runtimeTarget(value) {
  if (typeof value === 'string') return value
  return typeof value?.default === 'string' ? value.default : null
}

/** An entry with `*` replaced in every target. */
function substitute(value, star) {
  if (typeof value === 'string') return value.replace('*', star)
  return Object.fromEntries(Object.entries(value).map(([condition, target]) => [condition, substitute(target, star)]))
}

function filesUnder(dir, prefix = '') {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesUnder(join(dir, entry.name), `${prefix}${entry.name}/`)
      : [`${prefix}${entry.name}`],
  )
}

/**
 * Every exact subpath the map publishes under `root` (a checkout or an unpacked package), with
 * its entry. A module pattern expands to one subpath per emitted file; exact keys and
 * directory patterns come through unchanged.
 */
export function expandExports(exportsMap = {}, root = '.') {
  const out = {}
  for (const [key, value] of Object.entries(exportsMap)) {
    const target = runtimeTarget(value)
    if (!key.includes('*') || !target || target.endsWith('/*')) {
      out[key] = value
      continue
    }
    const [before, after] = target.split('*')
    for (const file of filesUnder(join(root, before))) {
      if (!file.endsWith(after)) continue
      const star = file.slice(0, file.length - after.length)
      if (star) out[key.replace('*', star)] ??= substitute(value, star)
    }
  }
  return out
}

/** Whether `subpath` (`./base/buttons`) is published by a key, exact or pattern, without reading files. */
export function matchesExport(exportsMap = {}, subpath) {
  return Object.keys(exportsMap).some((key) => {
    if (!key.includes('*')) return key === subpath
    const [before, after] = key.split('*')
    return subpath.length > before.length + after.length && subpath.startsWith(before) && subpath.endsWith(after)
  })
}
