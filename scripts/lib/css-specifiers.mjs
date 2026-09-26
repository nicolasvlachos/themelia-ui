/*
 * Every @import and url() in a shipped stylesheet must be ./ or ../ relative (data:, http(s):,
 * // and # are left alone) and resolve, with its exact on-disk case, to a file inside `root`.
 *
 * A bare `@import "core.css"` names a PACKAGE to Tailwind v4's own resolver (@tailwindcss/cli,
 * @tailwindcss/postcss, which Next.js with Tailwind runs, and @tailwindcss/vite before 4.3).
 * Vite, webpack, esbuild and postcss-import try it as a relative file first and forgive it,
 * which is how primitives.css shipped that way from 1.0.3 to 2.0.1 unnoticed. Exact case
 * stands in for the case-sensitive Linux file systems no local run sees.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const SKIP = /^(data:|https?:|\/\/|#)/i
const IMPORT = /@import\s+(?:url\(\s*)?(["']?)([^"')\s;]+)\1/g
const URL = /url\(\s*(["']?)([^"')]+)\1\s*\)/g

export function cssSpecifierFindings(root) {
  const base = resolve(root)
  const listing = new Map()
  const names = (dir) => listing.get(dir) ?? listing.set(dir, readdirSync(dir)).get(dir)
  const exact = (target) => {
    let at = base
    for (const part of relative(base, target).split(sep)) {
      if (!names(at).includes(part)) return false
      at = join(at, part)
    }
    return statSync(at).isFile()
  }
  const sheets = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith('.css')) sheets.push(p)
    }
  }
  walk(base)
  const findings = []
  for (const file of sheets.sort()) {
    const shown = relative(base, file)
    const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const check = (kind, specifier) => {
      if (SKIP.test(specifier)) return
      const path = specifier.replace(/[?#].*$/, '')
      if (!/^\.\.?\//.test(path)) return findings.push(`css-bare-specifier  ${shown} ${kind} "${specifier}"`)
      const target = resolve(dirname(file), path)
      const why = relative(base, target).startsWith('..') ? 'outside the package' : !existsSync(target) ? 'missing' : !exact(target) ? 'wrong case' : null
      if (why) findings.push(`css-unresolved  ${shown} ${kind} "${specifier}" (${why})`)
    }
    for (const m of source.matchAll(IMPORT)) check('@import', m[2])
    for (const m of source.replace(IMPORT, '').matchAll(URL)) check('url()', m[2])
  }
  return { findings, sheets: sheets.length }
}
