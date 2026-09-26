/*
 * Every family that reaches a hook (lib/rsc-manifest.mjs) must open with "use client" in its
 * dist bundle, and no server-pure family may carry it. Position is the check: the directive
 * counts only as the first statement, so after an import it is an inert string. Fails on
 * missing, not-first, over-marked, or a classified family with no bundle to check.
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
  const file = `dist/${family.id}.js`
  if (!existsSync(file)) continue
  checked++
  const source = readFileSync(file, 'utf8')
  if (!source.includes(DIRECTIVE)) {
    failures.push(`missing     ${file} has no "use client" — it reaches a hook via ${family.reason}`)
  } else if (!leadingDirective(source)) {
    failures.push(`not-first   ${file} has "use client" but not as the first statement, so it is an inert string`)
  }
}

/* A server-pure family marked "use client" drags itself and its imports onto the client. */
for (const family of server) {
  const file = `dist/${family.id}.js`
  if (!existsSync(file)) continue
  checked++
  if (readFileSync(file, 'utf8').includes(DIRECTIVE)) {
    failures.push(`over-marked ${file} is server-pure and declares "use client"`)
  }
}

/* Non-vacuity: a family with no bundle would otherwise pass unchecked. */
const unchecked = client.length + server.length - checked
if (unchecked > 0) failures.push(`${unchecked} classified family/families have no bundle in dist/ to check`)

if (failures.length) {
  console.log(`FAIL verify rsc — ${failures.length} problem(s)\n`)
  for (const line of failures.slice(0, 20)) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify rsc — ${checked} bundles: ${client.length} client-interactive families carry ` +
    `"use client" as their first statement, and ${server.length} server-pure families carry none.`,
)
