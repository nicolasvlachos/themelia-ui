/*
 * What a family's index exports, by text scan:
 *   publicSymbols     the whole surface: `export { … }` blocks, direct `export function|const`,
 *                     and files reached by `export * from "./x"`
 *   publicComponents  the Component/useHook subset a preview page must document
 * Keep the two apart: the component filter must not decide what the API reference lists.
 */
import { existsSync, readFileSync } from 'node:fs'

const isComponent = (symbol) => /^[A-Z][A-Za-z0-9]*$/.test(symbol) || /^use[A-Z]/.test(symbol)

/** Files reached by `export * from "./x"`, which a named-export scan never sees. */
export function starTargets(indexPath, text) {
  const dir = indexPath.replace(/\/[^/]+$/, '')
  const out = []
  for (const match of text.matchAll(/export\s*\*\s*from\s*["']\.\/([\w.-]+)["']/g)) {
    for (const ext of ['.tsx', '.ts']) {
      const candidate = `${dir}/${match[1]}${ext}`
      if (existsSync(candidate)) {
        out.push(candidate)
        break
      }
    }
  }
  return out
}

export function publicSymbols(source) {
  if (!source || !existsSync(source)) return []
  const text = readFileSync(source, 'utf8')
  const files = [text, ...starTargets(source, text).map((f) => readFileSync(f, 'utf8'))]
  const names = new Set()

  for (const body of files) {
    for (const block of body.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
      for (const raw of block[1].split(',')) {
        const entry = raw.trim()
        if (!entry || entry.startsWith('type ')) continue
        const symbol = (entry.split(/\s+as\s+/).pop() ?? entry).trim()
        if (/^[A-Za-z][\w]*$/.test(symbol)) names.add(symbol)
      }
    }
    /* `export function foo` / `export const foo` — never named in a block. */
    for (const match of body.matchAll(
      /^export\s+(?:async\s+)?(?:function|const|class|let|var)\s+([A-Za-z][\w]*)/gm,
    )) {
      names.add(match[1])
    }
  }
  names.delete('default')
  return [...names].sort()
}

export const publicComponents = (source) => publicSymbols(source).filter(isComponent)
