/*
 * Which families must carry "use client": any whose own files or kit imports call a React
 * hook (every hook, useMemo and useId included), call createContext, or already declare the
 * directive. Computed from source on each run rather than listed, so a family that gains a
 * hook is reclassified without a hand edit.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** Comments are not code: prose naming a hook must not make a family client-only. */
const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')

/** Anything that makes a module client-only. */
const CLIENT_MARKERS = [
  /\buse[A-Z]\w*\s*\(/,          // any hook call
  /\bcreateContext\s*\(/,
  /["']use client["']/,
]

/** `@/x` and relative specifiers resolve inside the kit; bare ones are dependencies. */
function resolveKitImport(fromFile, spec) {
  let base
  if (spec.startsWith('@/')) base = resolve('src', spec.slice(2))
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec)
  else return null

  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

function sourceFilesUnder(dir) {
  const out = []
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) out.push(full)
    }
  }
  if (existsSync(dir)) walk(dir)
  return out
}

/**
 * Does this entry reach a client marker, following imports through the kit? Returns the
 * first file that proves it, so a failure names something a person can open.
 */
function clientReasonFor(entrySource, seen = new Set()) {
  const start = resolve(entrySource)
  if (seen.has(start)) return null
  seen.add(start)
  if (!existsSync(start)) return null

  /* An index expands to its whole directory, which is also what the bundler pulls in. */
  const files = start.endsWith('index.ts') || start.endsWith('index.tsx')
    ? [start, ...sourceFilesUnder(dirname(start))]
    : [start]

  for (const file of files) {
    if (seen.has(file) && file !== start) continue
    seen.add(file)
    const text = stripComments(readFileSync(file, 'utf8'))
    if (CLIENT_MARKERS.some((marker) => marker.test(text))) return file

    /* `import type` is erased, so it is not a runtime edge (typography imports provider types). */
    for (const match of text.matchAll(/(?:^|\n)\s*(?:import|export)\s+(type\s+)?[^;\n]*?from\s+["']([^"']+)["']/g)) {
      if (match[1]) continue
      const next = resolveKitImport(file, match[2])
      if (!next) continue
      const reason = clientReasonFor(next, seen)
      if (reason) return reason
    }
  }
  return null
}

/** `{ client: [{ id, source, reason }], server: [{ id, source }] }` for every family. */
export function classifyFamilies(manifestPath = 'architecture/manifest.json') {
  const families = JSON.parse(readFileSync(manifestPath, 'utf8')).families
  const client = []
  const server = []
  for (const family of families) {
    const reason = clientReasonFor(family.source)
    if (reason) client.push({ id: family.id, source: family.source, reason })
    else server.push({ id: family.id, source: family.source })
  }
  return { client, server }
}
