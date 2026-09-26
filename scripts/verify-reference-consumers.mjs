/*
 * Installs examples/consumer-general (no optional peers) and consumer-admin (TanStack Table,
 * react-hook-form) from the packed tarball, then typechecks, builds and server-renders each:
 * nested providers, portals and shared forms are what one-import fixtures cannot exercise.
 * Also enforces import policy (no source alias or src/ path, exact subpaths, a stylesheet per
 * family) and that the consumer's own unlayered rule survives beside the kit's layers.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const EXAMPLES = ['consumer-general', 'consumer-admin']

/** Imports an example must never contain, and why each one would invalidate the example. */
const FORBIDDEN = [
  [/from\s+["']@\//, 'a source alias — a consumer has no `@/`'],
  [/from\s+["'][^"']*\/src\//, 'a path into this repository'],
  [/["']themelia-ui\/style\.css["']/, 'the full catalogue stylesheet, which defeats exact CSS'],
  [/["']themelia-ui\/(base|features|patterns|layout|admin)["']/, 'a broad barrel that is not published'],
]

/** Every `themelia-ui/...` specifier in a source tree. */
function importsOf(dir) {
  const found = []
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.(tsx?|css)$/.test(entry)) {
        const body = readFileSync(full, 'utf8')
        for (const [, spec] of body.matchAll(/["'](themelia-ui[^"']*)["']/g)) found.push({ file: full, spec })
      }
    }
  }
  walk(dir)
  return found
}

/**
 * JavaScript families imported without their stylesheet: they render broken and nothing
 * errors. `ui-provider`, `forms` and `forms-rhf` ship no CSS.
 */
function missingStylesheets(entries) {
  const NO_CSS = new Set(['themelia-ui/ui-provider', 'themelia-ui/forms', 'themelia-ui/forms-rhf'])
  const js = new Set(entries.filter((e) => !e.spec.endsWith('.css')).map((e) => e.spec))
  const css = new Set(entries.filter((e) => e.spec.endsWith('.css')).map((e) => e.spec))
  return [...js].filter((spec) => !NO_CSS.has(spec) && !css.has(`${spec}.css`)).sort()
}

function policyProblems(dir) {
  const problems = []
  const entries = importsOf(dir)
  for (const { file, spec } of entries) {
    for (const [pattern, why] of FORBIDDEN) {
      if (pattern.test(`from "${spec}"`) || pattern.test(`"${spec}"`)) problems.push(`${file}: ${spec} is ${why}`)
    }
  }
  for (const source of readdirSync(join(dir, 'src'))) {
    const body = readFileSync(join(dir, 'src', source), 'utf8')
    for (const [pattern, why] of FORBIDDEN.slice(0, 2)) {
      if (pattern.test(body)) problems.push(`${dir}/src/${source} imports ${why}`)
    }
  }
  for (const spec of missingStylesheets(entries)) {
    problems.push(`${dir}: imports ${spec} without ${spec}.css`)
  }
  return problems
}

/*
 * Built for the server with Vite, then run. Not vite-node: it externalises node_modules, so
 * Node's loader meets the kit's `.css` imports and throws.
 */
const SSR_CONFIG = `
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  ssr: { noExternal: ["themelia-ui"] },
  build: { ssr: "ssr-probe.tsx", outDir: "dist-ssr", emptyOutDir: true },
})
`

const SSR_PROBE = `
import { renderToString } from "react-dom/server"
import { createElement } from "react"
import { App } from "./src/app"

const html = renderToString(createElement(App))
if (typeof html !== "string" || html.length === 0) {
  console.error("the application server-rendered to nothing")
  process.exit(1)
}
console.log("ssr ok, " + html.length + " chars")
`

const failures = []

for (const example of EXAMPLES) {
  failures.push(...policyProblems(`examples/${example}`).map((p) => `policy    ${p}`))
}

const root = resolve(tmpdir(), 'themelia-ui-reference-consumers')
rmSync(root, { recursive: true, force: true })
mkdirSync(root, { recursive: true })

const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', root], { encoding: 'utf8' }).trim()
const tarballPath = join(root, tarball)

for (const example of EXAMPLES) {
  const project = join(root, example)
  cpSync(`examples/${example}`, project, { recursive: true })

  /* Only the tarball filename changes: everything else is the committed example. */
  const manifestPath = join(project, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  manifest.dependencies['themelia-ui'] = `file:${tarballPath}`
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  const run = (command, args) =>
    execFileSync(command, args, { cwd: project, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })

  try {
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--silent'])
  } catch (error) {
    failures.push(`install   ${example}: ${firstUseful(error)}`)
    continue
  }
  try {
    run('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'])
  } catch (error) {
    failures.push(`typecheck ${example}: ${firstUseful(error)}`)
  }
  try {
    run('npx', ['vite', 'build', '--logLevel', 'error'])
  } catch (error) {
    failures.push(`build     ${example}: ${firstUseful(error)}`)
    continue
  }

  const assets = join(project, 'dist', 'assets')
  const files = existsSync(assets) ? readdirSync(assets) : []
  const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n')
  const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n')

  /* The consumer's unlayered rule must survive the build to outrank the kit's layers. */
  if (!css.includes('.consumer-override')) {
    failures.push(`layers    ${example}: the consumer's unlayered rule did not survive the build`)
  }
  if (!/@layer/.test(css)) {
    failures.push(`layers    ${example}: no @layer survived, so the kit's cascade order is gone`)
  }
  /* A repository path in shipped output means the example resolved source, not the package. */
  for (const marker of ['/src/components/', 'themelia-ui/src/']) {
    if (js.includes(marker)) failures.push(`leak      ${example}: built JavaScript names ${marker}`)
  }

  /*
   * SSR of a whole composed app, where a provider or portal host reaches for `document`;
   * ssr-surface.test.tsx covers each family alone.
   */
  writeFileSync(join(project, 'ssr-probe.tsx'), SSR_PROBE)
  /*
   * Into the copy only: `ssr.noExternal` (without it Node throws on the kit's `.css`
   * imports) belongs to the consumer's framework, not to an example a reader would copy.
   */
  writeFileSync(join(project, 'vite.ssr.config.ts'), SSR_CONFIG)
  try {
    run('npx', ['vite', 'build', '--config', 'vite.ssr.config.ts', '--logLevel', 'error'])
    const out = run('node', ['dist-ssr/ssr-probe.js'])
    if (!/ssr ok/.test(out)) failures.push(`ssr       ${example}: probe said ${out.trim().slice(0, 120)}`)
  } catch (error) {
    failures.push(`ssr       ${example}: ${firstUseful(error)}`)
  }
}

rmSync(root, { recursive: true, force: true })

if (failures.length) {
  console.log(`FAIL verify reference-consumers — ${failures.length} problem(s)\n`)
  for (const line of failures) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify reference-consumers — ${EXAMPLES.length} application(s) installed from the packed ` +
    'tarball, typechecked, built and server-rendered; exact subpaths only, every family ' +
    "stylesheet imported, and each consumer's own unlayered rule outranks the kit's layers.",
)

function firstUseful(error) {
  const raw = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  return (lines.find((l) => /error|Error|Cannot|not found|failed/.test(l)) ?? lines[0] ?? 'no output').slice(0, 200)
}
