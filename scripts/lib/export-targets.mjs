/*
 * The single reader of package.json exports entries, which nest by condition
 * (`{ import: { types, default }, require: { types, default } }`). Scripts read entries
 * through here instead of reaching for keys, so a shape change has one place to land.
 */

/** Every file an entry points at, flattened, with wildcards left in. */
export function targetPaths(value) {
  if (typeof value === 'string') return [value]
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap((nested) => targetPaths(nested))
}

/**
 * The declaration file a consumer resolves for an entry: `import.types` (what the API
 * snapshot describes), else a flat `types` from an older package.json.
 */
export function typesFor(value) {
  if (typeof value !== 'object' || value === null) return null
  if (typeof value.import === 'object' && value.import?.types) return value.import.types
  if (typeof value.types === 'string') return value.types
  return null
}
