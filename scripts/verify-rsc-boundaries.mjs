/*
 * Every family that reaches a hook (lib/rsc-manifest.mjs) must open with "use client" in
 * both dist bundles, and no server-pure family may carry it. Position is the check: the
 * directive counts only as the first statement, so after an import it is an inert string.
 * Fails on missing, not-first, over-marked, or fewer than 100 bundles checked.
 */
import { existsSync, readFileSync } from 'node:fs'

import { classifyFamilies } from './lib/rsc-manifest.mjs'

const DIRECTIVE = '"use client"'
const failures = []

if (!existsSync('dist')) {
  console.error('verify rsc — no dist/; run `npm run build:lib` first')
  process.exit(1)
}

/** The directive, if it is genuinely the first statement. Comments and blanks may precede. */
function leadingDirective(source) {
  const withoutComments = source.replace(/^\s*(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*)\s*/g, '')
  const trimmed = withoutComments.trimStart()
  return trimmed.startsWith(`${DIRECTIVE};`) || trimmed.startsWith(`'use client';`)
}

const { client, server } = classifyFamilies()
let checked = 0

for (const family of client) {
  for (const ext of ['js', 'cjs']) {
    const file = `dist/${family.id}.${ext}`
    if (!existsSync(file)) continue
    checked++
    const source = readFileSync(file, 'utf8')
    if (!source.includes(DIRECTIVE)) {
      failures.push(`missing     ${file} has no "use client" — it reaches a hook via ${family.reason}`)
    } else if (!leadingDirective(source)) {
      failures.push(`not-first   ${file} has "use client" but not as the first statement, so it is an inert string`)
    }
  }
}

/* A server-pure family marked "use client" drags itself and its imports onto the client. */
for (const family of server) {
  for (const ext of ['js', 'cjs']) {
    const file = `dist/${family.id}.${ext}`
    if (!existsSync(file)) continue
    checked++
    if (readFileSync(file, 'utf8').includes(DIRECTIVE)) {
      failures.push(`over-marked ${file} is server-pure and declares "use client"`)
    }
  }
}

/* Non-vacuity: a run that checked nothing would pass silently. */
if (checked < 100) failures.push(`only ${checked} bundle(s) were checked — the classification found almost nothing`)

if (failures.length) {
  console.log(`FAIL verify rsc — ${failures.length} problem(s)\n`)
  for (const line of failures.slice(0, 20)) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify rsc — ${checked} bundles: ${client.length} client-interactive families carry ` +
    `"use client" as their first statement in ESM and CJS, and ${server.length} server-pure ` +
    'families carry none.',
)
