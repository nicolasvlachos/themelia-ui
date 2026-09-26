/*
 * Writes a `.d.cts` beside every emitted `.d.ts`: the package is "type": "module", so under
 * node16 resolution a lone `.d.ts` gives `require` consumers ESM types. Relative `.js`
 * specifiers become `.cjs` too, or TypeScript would map them back to the ESM `.d.ts`.
 * Runs after fix-dts-extensions.mjs, which adds those `.js` extensions.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (path.endsWith('.d.ts')) out.push(path)
  }
  return out
}

let written = 0
for (const file of walk(DIST)) {
  const source = readFileSync(file, 'utf8')

  /* Relative specifiers only: a bare one resolves through that package's own exports map. */
  const cjs = source.replace(
    /(from\s*|import\s*\(\s*)(["'])(\.[^"']*?)\.js\2/g,
    (_, lead, quote, specifier) => `${lead}${quote}${specifier}.cjs${quote}`,
  )

  writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), cjs)
  written++
}

console.log(`cjs declarations: ${written} .d.cts written beside their .d.ts`)
