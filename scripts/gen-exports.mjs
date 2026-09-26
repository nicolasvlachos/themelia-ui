/*
 * Writes package.json "exports" for every manifest family, plus stylesheets and data files,
 * from what the library build emitted, so no subpath points at a missing file. Runs last in
 * `build:lib`; exits 1 when a family's JS, CJS or declarations were not emitted. Writes the
 * "exports" field only (the skill's imports.md belongs to gen-agent-skill.mjs).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const DIST = 'dist'

/* The authority on which families exist, and where each one's barrel lives. */
const manifest = JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))

if (!existsSync(DIST)) {
  console.error('gen-exports: no dist/ — run the library build first')
  process.exit(1)
}

/**
 * Where vite-plugin-dts put an entry's declaration. It mirrors src/ while the bundle is flat,
 * so derive it from the manifest's `source`. `styles` is not a family and stays named.
 */
function typesFor(entry) {
  if (entry === 'styles') return existsSync('dist/styles.d.ts') ? 'dist/styles.d.ts' : null
  const source = manifest.families.find((family) => family.id === entry)?.source
  if (!source) return null
  const candidate = source.replace(/^src\//, `${DIST}/`).replace(/\.tsx?$/, '.d.ts')
  return existsSync(candidate) ? candidate : null
}

/*
 * Families only, from the manifest rather than a dist/ walk (entries can sit at any depth).
 * Layer barrels are not published: one specifier would reach every optional peer in a layer.
 */
const entries = ['styles', ...manifest.families.map((family) => family.id)]

const exportsMap = {}
const missing = []

for (const entry of [...new Set(entries)].sort()) {
  const js = `./${DIST}/${entry}.js`
  const cjs = `./${DIST}/${entry}.cjs`
  if (!existsSync(js.slice(2)) || !existsSync(cjs.slice(2))) {
    missing.push(entry)
    continue
  }
  const types = typesFor(entry)
  if (!types) missing.push(`${entry} (types)`)
  /* Written by gen-cjs-declarations.mjs, with relative specifiers rewritten to .cjs. */
  const typesCjs = types ? types.replace(/\.d\.ts$/, '.d.cts') : null
  if (typesCjs && !existsSync(typesCjs)) missing.push(`${entry} (cjs types)`)

  const subpath = entry === 'index' ? '.' : `./${entry}`

  /*
   * Each condition carries its own declaration: the package is "type": "module", so one .d.ts
   * would give `require` ESM types. "types" stays first, since the first matching condition wins.
   */
  exportsMap[subpath] = {
    import: { ...(types ? { types: `./${types}` } : {}), default: js },
    require: { ...(typesCjs ? { types: `./${typesCjs}` } : {}), default: cjs },
  }
}


// The processed stylesheet, and the readable source tree behind it.
exportsMap['./style.css'] = './dist/style.css'
exportsMap['./styles/*'] = './dist/styles/*'
/*
 * Exact family stylesheets for CJS, SSR frameworks and explicit imports (ESM entries already
 * import their CSS). Each is an @import index over css/, so the bytes exist once.
 */
let cssTargets = 0
for (const entry of [...new Set(entries)].sort()) {
  const css = `./${DIST}/${entry}.css`
  if (!existsSync(css.slice(2))) continue
  exportsMap[entry === 'index' ? './style.css' : `./${entry}.css`] ??= css
  cssTargets++
}
if (existsSync(`${DIST}/core.css`)) exportsMap['./core.css'] = `./${DIST}/core.css`
/* Tailwind v4 theme bridge: imported into a consumer's Tailwind entry, read at build time. */
if (existsSync(`${DIST}/tailwind.css`)) exportsMap['./tailwind.css'] = `./${DIST}/tailwind.css`
/* DTCG token export: data for design tooling, not read at runtime. */
if (existsSync(`${DIST}/tokens.json`)) exportsMap['./tokens.json'] = `./${DIST}/tokens.json`

/* Profile import ceilings as JSON a tool can fetch, generated from the manifest. */
for (const profile of ['general', 'admin']) {
  const file = `./${DIST}/profiles/${profile}.json`
  if (existsSync(file.slice(2))) exportsMap[`./profiles/${profile}.json`] = file
}

exportsMap['./package.json'] = './package.json'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const before = JSON.stringify(pkg.exports ?? null)
pkg.exports = exportsMap
const after = JSON.stringify(pkg.exports)

if (before !== after) {
  /* Keep the file's own indentation, so an exports change is not a whole-file diff. */
  const indent = readFileSync('package.json', 'utf8').match(/\n([ \t]+)"/)?.[1] ?? '  '
  writeFileSync('package.json', `${JSON.stringify(pkg, null, indent)}\n`)
}

const count = Object.keys(exportsMap).length
console.log(
  `exports: ${count} subpaths (${cssTargets} family stylesheets) ${before === after ? '(already current)' : 'written'}` +
    (missing.length ? `\n  MISSING: ${missing.join(', ')}` : ''),
)
if (missing.length) process.exit(1)
