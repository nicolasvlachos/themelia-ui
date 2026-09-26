/*
 * The single reader of package.json exports entries (`{ types, default }`, or a string for a
 * stylesheet or data file). Scripts read entries through here instead of reaching for keys, so
 * a shape change has one place to land.
 */

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
