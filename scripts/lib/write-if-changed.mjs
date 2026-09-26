import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Writes only when the content differs. A generator that rewrote an unchanged file moved its
 * mtime past dist/, and `verify package` then failed a fresh build as stale.
 */
export function writeIfChanged(path, text) {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) return false
  writeFileSync(path, text)
  return true
}
