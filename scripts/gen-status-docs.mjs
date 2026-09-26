/*
 * Rewrites the `status` block in CONTRIBUTING.md from repository facts, between its markers;
 * fails if the marker pair is missing. `verify docs-freshness` regenerates and compares, so
 * only numbers inside the markers are kept honest: put any new count in a block.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { writeIfChanged } from './lib/write-if-changed.mjs'

import { collectRepositoryFacts, renderStatusMarkdown } from './lib/repository-facts.mjs'

const TARGET = 'CONTRIBUTING.md'
const BLOCKS = [{ name: 'status', render: renderStatusMarkdown }]

const openMarker = (name) => `<!-- GENERATED:${name} by scripts/gen-status-docs.mjs — do not edit. -->`
const closeMarker = (name) => `<!-- /GENERATED:${name} -->`

/** Oxlint warnings counted now; `null` (rendered "not measured") when the linter cannot run. */
function countLintWarnings() {
  try {
    const out = execFileSync('npx', ['oxlint'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    return (out.match(/^\S+:\d+:\d+: warning/gm) ?? []).length
  } catch (error) {
    /* Oxlint exits nonzero on findings, so its output is still the answer. */
    const out = `${error.stdout ?? ''}`
    if (!out) return null
    return (out.match(/^\S+:\d+:\d+: warning/gm) ?? []).length
  }
}

const facts = collectRepositoryFacts('.', { lintWarnings: countLintWarnings() })

let text = readFileSync(TARGET, 'utf8')

for (const { name, render } of BLOCKS) {
  const open = openMarker(name)
  const close = closeMarker(name)
  const start = text.indexOf(open)
  const end = text.indexOf(close)

  if (start === -1 || end === -1) {
    console.error(
      `FAIL gen-status-docs — ${TARGET} has no generated ${name} block.\n` +
        `  Add these two markers around it:\n    ${open}\n    ${close}`,
    )
    process.exit(1)
  }

  text = text.slice(0, start) + `${open}\n\n${render(facts)}\n\n${close}` + text.slice(end + close.length)
}

writeIfChanged(TARGET, text)

console.log(
  `status docs: ${facts.packageVersion}, ${facts.families} modules, ` +
    `${facts.jsEntrypoints} JS and ${facts.cssEntrypoints} CSS entrypoints, ` +
    `${facts.lintWarnings === null ? 'lint not measured' : `${facts.lintWarnings} lint warning(s)`}`,
)
