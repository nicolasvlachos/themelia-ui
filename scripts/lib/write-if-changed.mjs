import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Writes only when the content differs. Rewriting an unchanged file would move its mtime past
 * dist/, and `verify package` would then fail a fresh build as stale.
 */
export function writeIfChanged(path, text) {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) return false
  writeFileSync(path, text)
  return true
}
