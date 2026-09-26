/*
 * Adds explicit extensions to relative specifiers in emitted declarations. Consumers on
 * node16/nodenext resolve this "type": "module" package under ESM rules, where an
 * extensionless relative import is TS2834; bundler resolution, used here, never sees it.
 * `./x` becomes `./x.js` or `./x/index.js`, knowable only once every file exists, so this
 * runs after the build. Exits 1 on a specifier that resolves to neither.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ROOT = 'dist'
// `from "./x"`, `import("./x")`, and bare `import "./x"`.
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.[^"']*)\2/g

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) walk(path, acc)
    else if (entry.name.endsWith('.d.ts')) acc.push(path)
  }
  return acc
}

let rewritten = 0
let files = 0
const unresolved = []

for (const file of walk(ROOT)) {
  const source = readFileSync(file, 'utf8')
  let touched = false

  const next = source.replace(SPECIFIER, (whole, lead, quote, spec) => {
    // Leave anything that already carries an extension alone.
    if (/\.(js|mjs|cjs|json|css)$/.test(spec)) return whole

    const base = resolve(dirname(file), spec)
    let replacement = null
    if (existsSync(`${base}.d.ts`)) replacement = `${spec}.js`
    else if (existsSync(`${base}/index.d.ts`)) replacement = `${spec}/index.js`

    if (!replacement) {
      unresolved.push(`${file} → ${spec}`)
      return whole
    }
    touched = true
    rewritten++
    return `${lead}${quote}${replacement}${quote}`
  })

  if (touched) {
    writeFileSync(file, next)
    files++
  }
}

console.log(`dts extensions: ${rewritten} specifier(s) across ${files} file(s)`)
if (unresolved.length) {
  console.error(`  ${unresolved.length} unresolved:`)
  for (const u of unresolved.slice(0, 10)) console.error(`    ${u}`)
  process.exit(1)
}
