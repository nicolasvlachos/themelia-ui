/*
 * Runs consumers against the `npm pack` tarball (in a tmpdir) — what type-checking cannot see.
 * Fixtures: peer-leak (general subpaths load with no optional peers), cjs, ssr, two-roots,
 * vite (bundled CSS layering, narrow and deduplicated), tailwind (layer order), tiptap (with
 * peers, in a separate unpacked copy so its links cannot reach the absent-peer fixtures),
 * skill-install / skill-finder (the shipped consumer scripts). Fails if any fixture fails.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
import { tmpdir } from 'node:os'

const manifest = JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const name = pkg.name

const root = resolve(tmpdir(), 'themelia-ui-consumer-fixture')
rmSync(root, { recursive: true, force: true })
mkdirSync(`${root}/node_modules`, { recursive: true })

const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', root], {
  encoding: 'utf8',
}).trim()
execFileSync('tar', ['-xzf', `${root}/${tarball}`, '-C', root])
const packageLink = `${root}/node_modules/${name}`
mkdirSync(dirname(packageLink), { recursive: true })
symlinkSync(`${root}/package`, packageLink, 'dir')

/*
 * What `npm install themelia-ui` puts on disk: hard dependencies and the required React
 * peers. Optional peers are deliberately absent — the peer-leak fixture depends on it.
 */
const installed = [...Object.keys(pkg.dependencies ?? {}), 'react', 'react-dom', 'scheduler']
for (const dep of installed) {
  const from = resolve('node_modules', dep)
  if (!existsSync(from)) continue
  const to = `${root}/node_modules/${dep}`
  if (dep.includes('/')) mkdirSync(to.slice(0, to.lastIndexOf('/')), { recursive: true })
  symlinkSync(from, to, 'dir')
}
writeFileSync(`${root}/package.json`, JSON.stringify({ name: 'fixture', private: true }, null, 2))

/* General-profile families with no optional peers — what a plain consumer installs. */
const clean = manifest.families.filter(
  (family) => family.profile === 'general' && family.optionalPeers.length === 0,
)
const admin = manifest.families.filter((family) => family.profile === 'admin')

const failures = []

function run(label, source, directory = root) {
  const file = `${directory}/${label}.cjs`
  writeFileSync(file, source)
  try {
    const out = execFileSync('node', [file], { encoding: 'utf8', cwd: directory })
    return out.trim()
  } catch (error) {
    /* The useful line: Node's stack starts with `throw err;` and a caret. */
    const raw = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim()
    const lines = raw.split('\n').map((line) => line.trim())
    const message =
      lines.find((line) => /^(\w*Error|Cannot find module)/.test(line)) ??
      lines.find((line) => line && !/^(throw err;|\^|at |Require stack:|-\s)/.test(line)) ??
      lines[0]
    failures.push(`${label.padEnd(13)} ${message}`)
    return null
  }
}

/* 1 — every peer-free general subpath loads with no optional peers on disk. */
const cjsList = clean
  .map((family) => `${name}${family.export.slice(1)}`)
  .filter((subpath) => pkg.exports[`.${subpath.slice(name.length)}`]?.require)
run(
  'peer-leak',
  `const subpaths = ${JSON.stringify(cjsList)}\n` +
    'for (const subpath of subpaths) {\n' +
    '  const loaded = require(subpath)\n' +
    '  if (!loaded || typeof loaded !== "object") throw new Error(subpath + " exported nothing")\n' +
    '}\n' +
    'console.log(subpaths.length)\n',
)

/* 2 — the admin profile loads too. */
run(
  'cjs',
  `const subpaths = ${JSON.stringify(admin.map((f) => `${name}${f.export.slice(1)}`))}\n` +
    'for (const subpath of subpaths) require(subpath)\n' +
    `require(${JSON.stringify(name)})\n` +
    'console.log("ok")\n',
)

/* 3 — server rendering, through the provider and a component that draws. */
run(
  'ssr',
  'const React = require("react")\n' +
    'const { renderToString } = require("react-dom/server")\n' +
    `const { CSPProvider, UIProvider } = require(${JSON.stringify(`${name}/ui-provider`)})\n` +
    `const { Badge } = require(${JSON.stringify(`${name}/base/badge`)})\n` +
    `const { Money } = require(${JSON.stringify(`${name}/primitives`)})\n` +
    'const html = renderToString(\n' +
    '  React.createElement(CSPProvider, { nonce: "fixture-nonce" },\n' +
    '    React.createElement(UIProvider, { config: { colorScheme: "dark", money: { defaultCurrency: "EUR" } } },\n' +
    '      React.createElement(Badge, null, "live"),\n' +
    '      React.createElement(Money, { amount: 1234.5 }))))\n' +
    'if (!html.includes("live")) throw new Error("Badge did not render: " + html)\n' +
    'if (!/1[.,\\u00a0\\u202f]?234/.test(html)) throw new Error("Money did not format: " + html)\n' +
    'if (!/(€|EUR)/.test(html)) throw new Error("Money ignored the configured default currency: " + html)\n' +
    'console.log("ok")\n',
)

/* 4 — two roots, rendered independently, must not share configuration. */
run(
  'two-roots',
  'const React = require("react")\n' +
    'const { renderToString } = require("react-dom/server")\n' +
    `const { UIProvider } = require(${JSON.stringify(`${name}/ui-provider`)})\n` +
    `const { UIScope } = require(${JSON.stringify(`${name}/ui-provider`)})\n` +
    'const tree = (density) => React.createElement(UIProvider, { config: { density } },\n' +
    '  React.createElement(UIScope, { transparent: false }, React.createElement("span", null, density)))\n' +
    'const compact = renderToString(tree("compact"))\n' +
    'const comfortable = renderToString(tree("comfortable"))\n' +
    'if (!compact.includes("compact") || compact.includes("comfortable"))\n' +
    '  throw new Error("first root leaked: " + compact)\n' +
    'if (!comfortable.includes("comfortable"))\n' +
    '  throw new Error("second root did not apply its own config: " + comfortable)\n' +
    'console.log("ok")\n',
)

/*
 * The kit's layers in the order a bundle must first declare them. A bundler may drop the
 * `@layer ...;` statement, so first appearance decides: a `components` block ahead of
 * `tokens` puts the base reset above every component rule, and a Button renders unstyled.
 */
const LAYERS = ['tokens', 'theming', 'base', 'components', 'utilities']
function layerOrder(css) {
  const seen = []
  for (const match of css.matchAll(/@layer\s*([^{;]+)[;{]/g)) {
    for (const layer of match[1].split(',').map((part) => part.trim())) {
      if (LAYERS.includes(layer) && !seen.includes(layer)) seen.push(layer)
    }
  }
  return seen
}
function assertLayerOrder(css, what, required = ['tokens', 'theming', 'base', 'components']) {
  const order = layerOrder(css)
  const missing = required.filter((layer) => !order.includes(layer))
  if (missing.length) throw new Error(`${what}: the bundle has no ${missing.join(', ')} layer — core.css was dropped`)
  const expected = LAYERS.filter((layer) => order.includes(layer))
  if (order.join() !== expected.join()) {
    throw new Error(`${what}: the bundle declares its layers as ${order.join(' < ')}, not ${expected.join(' < ')}`)
  }
}

/* A one-file Vite app over the packed package, built; returns the emitted CSS. */
function buildViteApp(dir, main) {
  mkdirSync(`${root}/${dir}/src`, { recursive: true })
  writeFileSync(
    `${root}/${dir}/index.html`,
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  )
  writeFileSync(`${root}/${dir}/src/main.tsx`, main.join('\n'))
  writeFileSync(
    `${root}/${dir}/vite.config.mjs`,
    'import react from "@vitejs/plugin-react"\nexport default { plugins: [react()], logLevel: "error" }\n',
  )
  execFileSync('node', [resolve('node_modules/vite/bin/vite.js'), 'build'], {
    cwd: `${root}/${dir}`,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const css = readdirSync(`${root}/${dir}/dist/assets`).filter((file) => file.endsWith('.css'))
  return css.map((file) => readFileSync(`${root}/${dir}/dist/assets/${file}`, 'utf8')).join('')
}

/*
 * 5 — a real Vite build of the ESM entries and family stylesheets. There is deliberately no
 * separate core import: each family CSS entry must `@import "../core.css"` itself, or the
 * cascade-order assertion fails. (`verify package` checks the CJS entry carries no CSS.)
 */
mkdirSync(`${root}/app/src`, { recursive: true })
for (const dep of ['vite', '@vitejs/plugin-react']) {
  const from = resolve('node_modules', dep)
  if (!existsSync(from)) continue
  const to = `${root}/node_modules/${dep}`
  if (dep.includes('/')) mkdirSync(to.slice(0, to.lastIndexOf('/')), { recursive: true })
  if (!existsSync(to)) symlinkSync(from, to, 'dir')
}
writeFileSync(
  `${root}/app/index.html`,
  '<!doctype html><html><body><div id="root"></div>' +
    '<script type="module" src="/src/main.tsx"></script></body></html>',
)
/*
 * A consumer's own stylesheet, imported after the kit's. It must stay unlayered in the build,
 * so it beats the kit's `@layer components` rules whatever the specificity.
 */
writeFileSync(
  `${root}/app/src/app.css`,
  [
    '.consumer-override { padding: 3px }',
    '',
  ].join('\n'),
)

writeFileSync(
  `${root}/app/src/main.tsx`,
  [
    `import { createRoot } from "react-dom/client"`,
    `import { CSPProvider, UIProvider } from "${name}/ui-provider"`,
    `import { Badge } from "${name}/base/badge"`,
    /* A second family, so the shared typography chunk has two claimants to deduplicate. */
    `import { Button } from "${name}/base/buttons"`,
    `import "${name}/base/badge.css"`,
    `import "${name}/base/buttons.css"`,
    'import "./app.css"',
    '',
    'createRoot(document.getElementById("root")!).render(',
    '  <CSPProvider disableStyleElements><UIProvider><Badge className="consumer-override" tone="success">shipped</Badge><Button>Save</Button></UIProvider></CSPProvider>,',
    ')',
    '',
  ].join('\n'),
)
writeFileSync(
  `${root}/app/vite.config.mjs`,
  [
    'import react from "@vitejs/plugin-react"',
    'export default { plugins: [react()], logLevel: "error" }',
    '',
  ].join('\n'),
)

try {
  execFileSync('node', [resolve('node_modules/vite/bin/vite.js'), 'build'], {
    cwd: `${root}/app`,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const assets = readdirSync(`${root}/app/dist/assets`)
  const js = assets.find((file) => file.endsWith('.js'))
  const css = assets.find((file) => file.endsWith('.css'))
  if (!js) throw new Error('no JS emitted')
  if (!css) throw new Error('no CSS emitted — the ESM entry did not carry its stylesheet')
  const bundledCss = readFileSync(`${root}/app/dist/assets/${css}`, 'utf8')
  assertLayerOrder(bundledCss, 'family sheets')
  /*
   * The guarantee `cssModulesInComponentsLayer` exists for: the consumer's rule is UNLAYERED
   * in the output, so it beats every kit rule (Tailwind utilities rely on the same thing).
   */
  const consumerRule = bundledCss.indexOf('.consumer-override')
  if (consumerRule === -1) throw new Error("the consumer's own stylesheet did not reach the bundle")
  const layeredUpTo = bundledCss.slice(0, consumerRule).lastIndexOf('@layer')
  const closedBefore = bundledCss.slice(layeredUpTo, consumerRule)
  const depth = [...closedBefore].reduce(
    (open, char) => open + (char === '{' ? 1 : char === '}' ? -1 : 0),
    0,
  )
  if (depth > 0) {
    throw new Error("the consumer's rule was wrapped in a layer and would lose to the kit's")
  }
  if (!readFileSync(`${root}/app/dist/assets/${js}`, 'utf8').includes('shipped')) {
    throw new Error('the component did not reach the bundle')
  }

  /* Narrow bundle: only the imported families' rules may appear (spot-checked markers). */
  if (!bundledCss.includes('.badge__')) {
    throw new Error("the imported family's own rules are missing from the bundle")
  }
  const strangers = ['.table__', '.kanban__', '.calendar__', '.chart__']
    .filter((marker) => bundledCss.includes(marker))
  if (strangers.length) {
    throw new Error(
      `a Badge-only consumer received rules from ${strangers.length} family/families it never ` +
        `imported: ${strangers.join(', ')}`,
    )
  }

  /*
   * Deduplication: two families `@import`ing the shared typography chunk must not each
   * contribute a copy. A hashed selector must appear in the bundle as many times as in the
   * chunk (it may repeat within one sheet); a marker absent from the bundle is an error.
   */
  const shared = readFileSync(`${root}/package/dist/css/typography.css`, 'utf8')
  const markers = [...shared.matchAll(/\.[a-z-]*[a-z0-9]__[A-Za-z0-9]*___[A-Za-z0-9_-]+/g)].map((m) => m[0])
  const marker = markers.find((candidate) => bundledCss.includes(candidate))
  if (!marker) {
    throw new Error(
      'no typography selector from the shared chunk reached the bundle — the dedup check ' +
        'would have measured nothing',
    )
  }
  const inChunk = shared.split(marker).length - 1
  const inBundle = bundledCss.split(marker).length - 1
  if (inBundle !== inChunk) {
    throw new Error(
      `the shared typography chunk appears ${inBundle / inChunk}× in the bundle (${inBundle} ` +
        `occurrences of a selector the chunk has ${inChunk}) — family sheets are not deduplicating`,
    )
  }
} catch (error) {
  /* Vite's own summary line says nothing; the line above it names the specifier. */
  const raw = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`
    /* Strip Vite's colour codes (ANSI is built from a char code to keep ESC out of source). */
    .replace(ANSI, '')
    .trim()
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  const useful =
    lines.find((line) =>
      /is not exported|Failed to resolve|Cannot find module|does not provide|no (JS|CSS)|did not/.test(line),
    ) ??
    lines.find((line) => /^\w*Error/.test(line)) ??
    lines[0]
  failures.push(`vite          ${useful.slice(0, 160)}`)
}

/*
 * 5b — the setups a tree-shaking bundler used to break. Each family entry was a re-export
 * module holding the only `import "../core.css"`; `sideEffects: ["**\/*.css"]` let Vite 8,
 * Rspack and webpack 5 drop it, core and all. A JS-only import then shipped no tokens, the
 * README's order (components first, then `style.css`) declared `components` first, and the
 * `themelia-ui/styles` entry, which is nothing but a stylesheet import, shipped nothing.
 */
for (const [dir, what, main, required] of [
  ['app-js-only', 'JS only', [
    `import { createRoot } from "react-dom/client"`,
    `import { Button } from "${name}/base/buttons"`,
    'createRoot(document.getElementById("root")!).render(<Button>Save</Button>)',
    '',
  ]],
  ['app-js-first', 'JS, then style.css', [
    `import { createRoot } from "react-dom/client"`,
    `import { Button } from "${name}/base/buttons"`,
    `import { UIProvider } from "${name}/ui-provider"`,
    `import "${name}/style.css"`,
    'createRoot(document.getElementById("root")!).render(<UIProvider><Button>Save</Button></UIProvider>)',
    '',
  ]],
  ['app-styles-entry', 'the styles entry', [
    `import "${name}/styles"`,
    'document.body.dataset.ready = "1"',
    '',
  ], ['tokens', 'theming', 'base']],
]) {
  try {
    const css = buildViteApp(dir, main)
    assertLayerOrder(css, what, required)
    if (!/--primary\s*:/.test(css)) throw new Error(`${what}: the bundle defines no tokens`)
    if (!css.includes('@font-face')) throw new Error(`${what}: the bundle loads no typeface`)
  } catch (error) {
    const raw = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`.replace(ANSI, '').trim()
    failures.push(`vite          ${raw.split('\n').find((line) => line.includes(what)) ?? raw.split('\n')[0]}`.slice(0, 200))
  }
}

/*
 * 6 — a Tailwind v4 consumer. Tailwind's `theme, base, components, utilities` layers merge
 * with the kit's same-named ones, and the bundler may drop the kit's order statement, so
 * first appearance decides. `components` must still precede `utilities`.
 */
function tailwindFixture() {
  for (const dep of ['tailwindcss', '@tailwindcss/vite']) {
    const from = resolve('node_modules', dep)
    if (!existsSync(from)) return 'skipped — tailwindcss is not installed'
    const to = `${root}/node_modules/${dep}`
    if (dep.includes('/')) mkdirSync(to.slice(0, to.lastIndexOf('/')), { recursive: true })
    if (!existsSync(to)) symlinkSync(from, to, 'dir')
  }

  mkdirSync(`${root}/tw/src`, { recursive: true })
  writeFileSync(
    `${root}/tw/index.html`,
    '<!doctype html><html><body><div id="root"></div>' +
      '<script type="module" src="/src/main.tsx"></script></body></html>',
  )
  writeFileSync(`${root}/tw/src/app.css`, '@import "tailwindcss";\n')
  writeFileSync(
    `${root}/tw/src/main.tsx`,
    [
      'import { createRoot } from "react-dom/client"',
      `import { Badge } from "${name}/base/badge"`,
      /* Tailwind FIRST on purpose: the harder of the two orders. */
      'import "./app.css"',
      `import "${name}/base/badge.css"`,
      '',
      'createRoot(document.getElementById("root")!).render(',
      '  <Badge className="p-7" tone="success">shipped</Badge>,',
      ')',
      '',
    ].join('\n'),
  )
  writeFileSync(
    `${root}/tw/vite.config.mjs`,
    [
      'import react from "@vitejs/plugin-react"',
      'import tailwind from "@tailwindcss/vite"',
      'export default { plugins: [react(), tailwind()], logLevel: "error" }',
      '',
    ].join('\n'),
  )

  execFileSync('node', [resolve('node_modules/vite/bin/vite.js'), 'build'], {
    cwd: `${root}/tw`,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const asset = readdirSync(`${root}/tw/dist/assets`).find((file) => file.endsWith('.css'))
  if (!asset) throw new Error('no CSS emitted from the Tailwind consumer')
  const css = readFileSync(`${root}/tw/dist/assets/${asset}`, 'utf8')

  const order = [...css.matchAll(/@layer\s+([\w-]+)\s*\{/g)].map((m) => m[1])
  const components = order.indexOf('components')
  const utilities = order.indexOf('utilities')
  if (components === -1 || utilities === -1) {
    throw new Error(`the merged bundle lost a layer — saw ${order.join(', ')}`)
  }
  if (components > utilities) {
    throw new Error(
      `components (${components}) now comes AFTER utilities (${utilities}); a consumer's ` +
        'Tailwind utility would lose to a kit component style',
    )
  }

  /* And the utility itself must land in `utilities`, or outside a layer entirely. */
  const at = css.indexOf('.p-7')
  if (at === -1) throw new Error("Tailwind's utility did not reach the bundle")
  let depth = 0
  let holder = '(unlayered)'
  for (let i = at; i >= 0; i--) {
    if (css[i] === '}') depth++
    else if (css[i] === '{') {
      if (depth === 0) {
        holder = css.slice(Math.max(0, i - 60), i).match(/@layer\s+([\w-]+)\s*$/)?.[1] ?? '(unlayered)'
        break
      }
      depth--
    }
  }
  if (holder !== '(unlayered)' && holder !== 'utilities') {
    throw new Error(`Tailwind's utility landed in @layer ${holder}, not utilities`)
  }
  return `components before utilities, utility in ${holder}`
}

let tailwind = 'skipped'
try {
  tailwind = tailwindFixture()
} catch (error) {
  const raw = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`.replace(ANSI, '').trim()
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  failures.push(
    `tailwind      ${(lines.find((line) => /now comes AFTER|landed in|lost a layer|did not reach|is not exported|Failed to resolve/.test(line)) ?? lines[0]).slice(0, 160)}`,
  )
}

/*
 * 7 — the default editor and both families that reach it, with TipTap installed. A separate
 * unpacked package, so Node's realpath resolution cannot leak these links to fixture 1.
 */
function tiptapFixture() {
  const directory = `${root}/with-tiptap`
  mkdirSync(`${directory}/node_modules`, { recursive: true })
  execFileSync('tar', ['-xzf', `${root}/${tarball}`, '-C', directory])
  const packageLink = `${directory}/node_modules/${name}`
  mkdirSync(dirname(packageLink), { recursive: true })
  symlinkSync(`${directory}/package`, packageLink, 'dir')
  for (const dep of [...installed, '@tiptap/core', '@tiptap/pm', '@tiptap/starter-kit', 'vite', '@vitejs/plugin-react']) {
    const from = resolve('node_modules', dep)
    if (!existsSync(from)) throw new Error(`TipTap consumer requires ${dep} to be installed`)
    const to = `${directory}/node_modules/${dep}`
    mkdirSync(dirname(to), { recursive: true })
    symlinkSync(from, to, 'dir')
  }
  writeFileSync(`${directory}/package.json`, JSON.stringify({ name: 'tiptap-consumer', private: true, type: 'module' }))

  run('tiptap-ssr', [
    'const React = require("react")',
    'const { renderToString } = require("react-dom/server")',
    `const { UIProvider } = require(${JSON.stringify(`${name}/ui-provider`)})`,
    `const { RichTextEditor } = require(${JSON.stringify(`${name}/features/rich-text-editor`)})`,
    `const { CommentComposer } = require(${JSON.stringify(`${name}/features/comments`)})`,
    `const { ActivityLog } = require(${JSON.stringify(`${name}/features/activities`)})`,
    `const { createTiptapEngine } = require(${JSON.stringify(`${name}/features/rich-text-editor/tiptap`)})`,
    'if (typeof createTiptapEngine !== "function") throw new Error("the adapter factory did not load")',
    'if (typeof document !== "undefined") throw new Error("SSR fixture unexpectedly has a DOM")',
    'const h = React.createElement',
    'const context = { id: "packed-record", type: "record" }',
    'const cases = [',
    '  ["editor", h(RichTextEditor, { value: "", onValueChange() {}, placeholder: "packed-editor" })],',
    '  ["comments", h(CommentComposer, { context, onSubmit() {}, placeholder: "packed-comments" })],',
    '  ["activities", h(ActivityLog, { entries: [], composer: { enabled: true, context, placeholder: "packed-activities" } })],',
    ']',
    'for (const [label, component] of cases) {',
    '  const html = renderToString(h(UIProvider, null, component))',
    '  if (!html.includes("rich-text-editor--component") || !html.includes("packed-" + label))',
    '    throw new Error(label + " did not server-render its editor")',
    '}',
    'console.log("four subpaths load; all three editor surfaces server-render without a DOM")',
  ].join('\n'), directory)

  mkdirSync(`${directory}/src`, { recursive: true })
  writeFileSync(`${directory}/index.html`, '<!doctype html><html><body><div id="root"></div>' +
    '<script type="module" src="/src/main.tsx"></script></body></html>')
  writeFileSync(`${directory}/src/main.tsx`, [
    'import { createRoot } from "react-dom/client"',
    `import { UIProvider } from "${name}/ui-provider"`,
    `import { RichTextEditor } from "${name}/features/rich-text-editor"`,
    `import { CommentComposer } from "${name}/features/comments"`,
    `import { ActivityLog } from "${name}/features/activities"`,
    `import { createTiptapEngine } from "${name}/features/rich-text-editor/tiptap"`,
    `import "${name}/features/rich-text-editor.css"`,
    `import "${name}/features/comments.css"`,
    `import "${name}/features/activities.css"`,
    'const context = { id: "packed-record", type: "record" }',
    'const engine = createTiptapEngine({ element: document.createElement("div"), content: "<p>custom</p>" })',
    'createRoot(document.getElementById("root")!).render(<UIProvider>',
    '  <RichTextEditor value="" onValueChange={() => {}} placeholder="packed-editor" />',
    '  <RichTextEditor engine={engine} value="<p>custom</p>" onValueChange={() => {}} />',
    '  <CommentComposer context={context} onSubmit={() => {}} placeholder="packed-comments" />',
    '  <ActivityLog entries={[]} composer={{ enabled: true, context, placeholder: "packed-activities" }} />',
    '</UIProvider>)',
  ].join('\n'))
  writeFileSync(`${directory}/vite.config.mjs`, [
    'import react from "@vitejs/plugin-react"',
    'export default { plugins: [react()], logLevel: "error" }',
  ].join('\n'))
  execFileSync('node', [resolve('node_modules/vite/bin/vite.js'), 'build'], {
    cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  })
  const assets = readdirSync(`${directory}/dist/assets`)
  const readAssets = (suffix) => assets.filter((file) => file.endsWith(suffix))
    .map((file) => readFileSync(`${directory}/dist/assets/${file}`, 'utf8')).join('\n')
  const js = readAssets('.js')
  const css = readAssets('.css')
  for (const family of ['editor', 'comments', 'activities']) {
    if (!js.includes(`packed-${family}`)) throw new Error(`${family} did not reach the TipTap consumer bundle`)
  }
  for (const family of ['rich-text-editor', 'comments', 'activities']) {
    if (!css.includes(`.${family}__`)) throw new Error(`${family} CSS did not reach the TipTap consumer bundle`)
  }
}

try {
  tiptapFixture()
} catch (error) {
  const raw = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`.replace(ANSI, '').trim()
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  const useful = lines.find((line) => /is not exported|Failed to resolve|Cannot find|did not|requires/.test(line)) ?? lines[0]
  failures.push(`tiptap        ${useful?.slice(0, 160) ?? 'fixture failed without diagnostics'}`)
}


rmSync(root, { recursive: true, force: true })

if (failures.length) {
  console.log(`FAIL verify consumer-fixtures — ${failures.length} fixture(s) failed\n`)
  for (const line of failures) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify consumer-fixtures — ${cjsList.length} peer-free general subpaths and ` +
    `${admin.length} admin subpaths load from a packed tarball without optional peers; ` +
    `SSR, two independent roots and a Vite build all succeed; Tailwind: ${tailwind}; ` +
    'the separate TipTap consumer loads four subpaths, server-renders three editor surfaces and bundles their ESM/CSS; ' +
    'the packed skill installs to both targets and its finder answers from node_modules.',
)
