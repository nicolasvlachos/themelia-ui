/*
 * Checks every preview-page PropTable row against the TypeScript source: the name must exist on
 * its owner, a literal default must match the source default, and a `css:` row must name a
 * declared token. Defaults it cannot evaluate are printed as NOTEs, not failures.
 */
import { readdirSync, readFileSync } from 'node:fs'
import ts from 'typescript'
import { verifyApiTables } from './lib/documented-api.mjs'

const configPath = ts.findConfigFile('.', ts.sys.fileExists, 'tsconfig.app.json')
const config = ts.readConfigFile(configPath, ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.')
// Map each exported subpath to its source file, so page imports resolve (lib-only ones included).
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const pathsToSource = { ...parsed.options.paths }
for (const [subpath, conditions] of Object.entries(pkg.exports)) {
  const declaration = conditions?.import?.types
  if (declaration?.startsWith('./dist/') && declaration.endsWith('.d.ts')) {
    pathsToSource[`${pkg.name}${subpath === '.' ? '' : subpath.slice(1)}`] = [declaration.replace('./dist/', './src/').replace(/\.d\.ts$/, '.ts')]
  }
}
const program = ts.createProgram(parsed.fileNames, { ...parsed.options, paths: pathsToSource })
const paths = readdirSync('src/preview/pages').filter(name => name.endsWith('.tsx')).sort().map(name => `src/preview/pages/${name}`)
const cssTokens = new Set()
function collectTokens(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) collectTokens(path)
    else if (entry.name.endsWith('.css')) for (const match of readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:/g)) cssTokens.add(match[1])
  }
}
collectTokens('src')
const result = verifyApiTables(program, paths, { cssTokens })
for (const diagnostic of result.diagnostics) console.log(`NOTE ${diagnostic}`)
for (const failure of result.failures) console.error(`FAIL ${failure}`)
console.log(`${result.failures.length ? 'FAIL' : 'PASS'} verify documented-defaults — ${result.names} API names across ${result.tables} tables; ${result.defaults} literal defaults agree; ${result.diagnostics.length} defaults require runtime/manual verification; ${result.failures.length} errors.`)
process.exitCode = result.failures.length ? 1 : 0
