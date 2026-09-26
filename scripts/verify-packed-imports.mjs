/*
 * Compiles every documented import (docs/generated/component-index.json) against the packed
 * tarball, never source aliases, which resolve subpaths a consumer cannot. The tarball is
 * unpacked offline with only React linked from this install, so no registry is needed.
 * Fails on missing-export (a documented symbol the subpath lacks), unresolved (a documented
 * stylesheet not in the package) or tiptap-types (the TipTap engine seam, compiled apart).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const index = JSON.parse(readFileSync('docs/generated/component-index.json', 'utf8'))
const records = Object.values(index.families)
const name = index.package ?? 'themelia-ui'

const root = resolve(tmpdir(), 'themelia-ui-packed-check')
rmSync(root, { recursive: true, force: true })
mkdirSync(`${root}/node_modules/@types`, { recursive: true })
mkdirSync(`${root}/probes`, { recursive: true })

const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', root], {
  encoding: 'utf8',
}).trim()
execFileSync('tar', ['-xzf', `${root}/${tarball}`, '-C', root])

/* The unpacked tarball IS the dependency; React comes from this repo's install. */
const packageLink = `${root}/node_modules/${name}`
mkdirSync(dirname(packageLink), { recursive: true })
symlinkSync(`${root}/package`, packageLink, 'dir')
for (const dep of ['react', 'react-dom']) {
  const from = resolve('node_modules', dep)
  if (existsSync(from)) symlinkSync(from, `${root}/node_modules/${dep}`, 'dir')
}
for (const dep of ['react', 'react-dom']) {
  const from = resolve('node_modules/@types', dep)
  if (existsSync(from)) symlinkSync(from, `${root}/node_modules/@types/${dep}`, 'dir')
}

const failures = []
const probes = []
for (const record of records) {
  if (!record.symbols.length) continue
  const file = `probes/${record.id.replace(/\//g, '__')}.ts`
  writeFileSync(
    `${root}/${file}`,
    `import { ${record.symbols.join(', ')} } from "${record.import}"\n` +
      `export const used = [${record.symbols.join(', ')}]\n`,
  )
  probes.push(file)

  /* A stylesheet a consumer is told to import must be inside the package. */
  if (record.css) {
    const subpath = record.css.slice(name.length)
    const exports = JSON.parse(readFileSync(`${root}/package/package.json`, 'utf8')).exports ?? {}
    const target = exports[`.${subpath}`]
    const resolved = typeof target === 'string' ? target : (target?.default ?? target?.style)
    if (!resolved || !existsSync(`${root}/package/${resolved.replace(/^\.\//, '')}`)) {
      failures.push(`unresolved      ${record.id}  ${record.css} — not in the packed tarball`)
    }
  }
}

writeFileSync(
  `${root}/tsconfig.json`,
  JSON.stringify(
    {
      compilerOptions: {
        target: 'es2023',
        lib: ['ES2023', 'DOM'],
        module: 'esnext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: ['react'],
      },
      include: ['probes'],
    },
    null,
    2,
  ),
)

let output = ''
try {
  execFileSync(resolve('node_modules/.bin/tsc'), ['-p', root], { encoding: 'utf8' })
} catch (error) {
  output = `${error.stdout ?? ''}${error.stderr ?? ''}`
}

for (const line of output.split('\n')) {
  const match = line.match(/probes\/([\w-]+__?[\w-]*)\.ts.*error TS\d+: (.*)/)
  if (!match) continue
  failures.push(`missing-export  ${match[1].replace(/__/g, '/')}  ${match[2]}`)
}
/* Anything tsc said that did not parse into a probe line still has to be reported. */
if (output.trim() && !failures.some((f) => f.startsWith('missing-export'))) {
  failures.push(`missing-export  (unparsed) ${output.trim().split('\n')[0]}`)
}

/*
 * An importable factory does not prove its options type is usable (skipLibCheck can hide a
 * `never`), so compile real TipTap and custom-engine calls against a second unpacked copy
 * with the documented peers linked.
 */
try {
  const directory = `${root}/with-tiptap`
  mkdirSync(`${directory}/node_modules`, { recursive: true })
  execFileSync('tar', ['-xzf', `${root}/${tarball}`, '-C', directory])
  const packageLink = `${directory}/node_modules/${name}`
  mkdirSync(dirname(packageLink), { recursive: true })
  symlinkSync(`${directory}/package`, packageLink, 'dir')
  for (const dep of ['react', 'react-dom', '@types/react', '@types/react-dom', '@tiptap/core', '@tiptap/pm', '@tiptap/starter-kit']) {
    const from = resolve('node_modules', dep)
    if (!existsSync(from)) throw new Error(`TipTap type probe requires ${dep} to be installed`)
    const to = `${directory}/node_modules/${dep}`
    mkdirSync(dirname(to), { recursive: true })
    symlinkSync(from, to, 'dir')
  }
  writeFileSync(`${directory}/probe.ts`, [
    'import { createElement, createRef } from "react"',
    'import StarterKit from "@tiptap/starter-kit"',
    `import { RichTextEditor, type RichTextEditorHandle, type RichTextEngine, type RichTextEngineState } from "${name}/features/rich-text-editor"`,
    `import { createTiptapEngine, type TiptapEngineOptions } from "${name}/features/rich-text-editor/tiptap"`,
    '',
    'const options: TiptapEngineOptions = {',
    '  element: document.createElement("div"),',
    '  content: "<p>custom schema</p>",',
    '  extensions: [StarterKit.configure({ underline: false })],',
    '}',
    'const tiptap: RichTextEngine = createTiptapEngine(options)',
    'tiptap.execute("underline")',
    'tiptap.mount?.(options.element)',
    'tiptap.setEditable?.(true)',
    'tiptap.insertHtml?.("<strong>hello</strong>")',
    'const caret: string | undefined = tiptap.getCaretContext?.()?.textBefore',
    'tiptap.replaceBeforeCaret?.(3, "<em>replacement</em>")',
    'tiptap.unmount?.()',
    'tiptap.destroy()',
    '',
    '// Existing custom engines remain valid without the optional capabilities.',
    'const state: RichTextEngineState = { html: "", active: new Set(), canUndo: false, canRedo: false }',
    'const custom: RichTextEngine = {',
    '  getState: () => state, setHtml() {}, focus() {}, execute() {},',
    '  subscribe: () => () => {}, destroy() {},',
    '}',
    'const extended: RichTextEngine = {',
    '  ...custom, mount: (element) => element, unmount() {}, setEditable(editable) { void editable },',
    '  insertHtml(html) { void html }, getCaretContext: () => ({ textBefore: "hello" }),',
    '  replaceBeforeCaret(length, html) { void length; void html },',
    '}',
    'const ref = createRef<RichTextEditorHandle>()',
    'export const consumer = createElement(RichTextEditor, {',
    '  engine: custom, ref, value: "", onValueChange: (html: string) => custom.setHtml(html),',
    '})',
    '// These errors also catch declarations that accidentally widen the seam to any.',
    '// @ts-expect-error A schema extension must be a TipTap extension object.',
    'const invalidOptions: TiptapEngineOptions = { ...options, extensions: ["not-an-extension"] }',
    '// @ts-expect-error Commands are the published command union.',
    'custom.execute("not-a-command")',
    'void [caret, extended, invalidOptions]',
  ].join('\n'))
  const config = JSON.parse(readFileSync(`${root}/tsconfig.json`, 'utf8'))
  writeFileSync(`${directory}/tsconfig.json`, JSON.stringify({ ...config, include: ['probe.ts'] }, null, 2))
  execFileSync(resolve('node_modules/.bin/tsc'), ['-p', directory], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
} catch (error) {
  const raw = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`.trim()
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  const diagnostic = lines.find((line) => /error TS\d+:/.test(line)) ?? lines[0]
  failures.push(`tiptap-types    ${diagnostic ?? 'compiler failed without diagnostics'}`)
}

rmSync(root, { recursive: true, force: true })

if (failures.length) {
  console.log(`FAIL verify packed-imports — ${failures.length} problem(s)\n`)
  for (const line of [...new Set(failures)].sort().slice(0, 40)) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify packed-imports — ${probes.length} subpaths and ` +
    `${records.filter((r) => r.css).length} stylesheets resolve from a packed tarball; ` +
    `${records.reduce((n, r) => n + r.symbols.length, 0)} documented symbols all exported; ` +
    'TipTap extensions and custom engine/ref consumers type-check.',
)
