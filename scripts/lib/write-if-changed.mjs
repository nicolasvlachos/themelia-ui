import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Writes only when the content differs. Rewriting an unchanged file would move its mtime past
 * dist/, and `verify package` would then fail a fresh build as stale. Creates the directory,
 * since generated output is not committed and a clone starts without it.
 */
export function writeIfChanged(path, text) {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) return false
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
  return true
}
