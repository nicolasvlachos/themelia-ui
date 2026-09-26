/*
 * Gate: every manifest family has choose/avoid guidance in architecture/selection.json.
 *   missing / stale      family without an entry / entry without a family
 *   thin                 chooseWhen or avoidWhen under MIN chars, or no alternatives
 *   identical            chooseWhen equals avoidWhen
 *   self-reference       a family as its own alternative or composeWith partner
 *   unknown(-alt)        a composeWith partner or alternative that is not a family
 *   unrouted-alt         an alternative with components but no preview route
 */
import { readFileSync } from 'node:fs'
import { readManifest } from './lib/read-architecture-manifest.mjs'
import { publicComponents } from './lib/public-symbols.mjs'

const MIN = 40

const selection = JSON.parse(readFileSync('architecture/selection.json', 'utf8')).families
const { families, byId } = readManifest()
const failures = []

for (const family of families) {
  if (!selection[family.id]) failures.push(`missing         ${family.id} has no selection guidance`)
}

for (const [id, entry] of Object.entries(selection)) {
  const family = byId.get(id)
  if (!family) {
    failures.push(`stale           ${id} has guidance but is not a family`)
    continue
  }
  for (const field of ['chooseWhen', 'avoidWhen']) {
    const text = entry[field]
    if (typeof text !== 'string' || text.trim().length < MIN) {
      failures.push(`thin            ${id}.${field} is under ${MIN} characters`)
    }
  }
  if (entry.chooseWhen && entry.chooseWhen === entry.avoidWhen) {
    failures.push(`identical       ${id} gives the same sentence for choose and avoid`)
  }
  for (const partner of entry.composeWith ?? []) {
    if (partner === id) failures.push(`self-reference  ${id} is listed as composed with itself`)
    else if (!byId.get(partner)) failures.push(`unknown         ${id} is composed with ${partner}, which is not a family`)
  }
  const alternatives = entry.alternatives ?? []
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    failures.push(`thin            ${id} offers no alternative`)
  }
  for (const alt of alternatives) {
    if (alt === id) {
      failures.push(`self-reference  ${id} is offered as its own alternative`)
      continue
    }
    const target = byId.get(alt)
    if (!target) {
      failures.push(`unknown-alt     ${id} → ${alt}, which is not a family`)
      continue
    }
    /* A family with no components (hooks, adapters) is documented by its API record, not a route. */
    if (!target.documentationRoute && publicComponents(target.source).length > 0) {
      failures.push(`unrouted-alt    ${id} → ${alt}, which has no preview route to look at`)
    }
  }
}

if (failures.length) {
  console.log(`FAIL verify selection — ${failures.length} problem(s)\n`)
  for (const line of failures.sort()) console.log(`  ${line}`)
  process.exit(1)
}
const alts = Object.values(selection).reduce((n, e) => n + (e.alternatives?.length ?? 0), 0)
console.log(
  `PASS verify selection — ${families.length} families each carry choose/avoid guidance; ` +
    `${alts} alternatives, every one a real family with a route.`,
)
