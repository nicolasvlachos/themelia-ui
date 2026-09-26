/*
 * One prop vocabulary across src/components and src/lib. Fails on:
 *   state-triplet  a `*Props` with `open` but no `onOpenChange`
 *   default-pair   `defaultValue` with no change handler
 *   banned-tone    `default`, `muted` or `error` in a tone union (the kit says `destructive`)
 *   polymorphic    an element-naming `as`-style prop; as-child: any `asChild` declaration.
 *                  Both use `render` (docs/adr/0005-polymorphic-render-contract.md).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

const walk = (dir, acc = []) => {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) walk(path, acc)
    else acc.push(path)
  }
  return acc
}

const files = walk('src/components')
  .concat(walk('src/lib'))
  .filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.d.ts'))

const failures = []

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const where = file.replace('src/', '')

  /* `*Props` only: data shapes (a `Credential` has a `value`) are not controlled state. */
  for (const block of text.matchAll(/export interface (\w*Props)\s*(?:extends[^{]*)?\{([\s\S]*?)\n\}/g)) {
    const [, name, body] = block
    const has = (prop) => new RegExp(`^\\s*${prop}\\??:`, 'm').test(body)

    /*
     * Bare `value` is not checked: Progress or InlineStat only display one. `defaultValue`
     * exists only to seed user-changeable state, so it needs a change handler.
     */
    if (has('open') && !has('onOpenChange')) {
      failures.push(`state-triplet  ${where}  ${name} takes \`open\` with no \`onOpenChange\``)
    }
    if (has('defaultValue') && !/on(Value)?Change|onSelect|onCheckedChange/.test(body)) {
      failures.push(`default-pair   ${where}  ${name} takes \`defaultValue\` with no change handler`)
    }
    /* Any `*as` prop that names an element, e.g. `contentAs?: "main" | "div"`, not just `as`. */
    const asProp = body.match(/^\s*(\w*[aA]s)\??:\s*(?:(?:React\.)?ElementType|["'][a-z]+["']\s*\|)/m)
    if (asProp) {
      failures.push(`polymorphic    ${where}  ${name} takes \`${asProp[1]}\` — the contract is \`render\``)
    }
  }

  /* Whole file, not the `*Props` loop: `asChild` also hides in inline type literals and aliases. */
  for (const decl of text.matchAll(/^\s*asChild\??:/gm)) {
    const line = text.slice(0, decl.index).split('\n').length
    failures.push(`as-child       ${where}:${line}  declares \`asChild\` — the contract is \`render\``)
  }

  /* Tone unions, wherever they are declared. */
  for (const union of text.matchAll(/export type (\w*[Tt]one\w*)\s*=\s*([^\n]+)/g)) {
    for (const banned of ['"default"', '"muted"', '"error"']) {
      if (union[2].includes(banned)) {
        failures.push(`banned-tone    ${where}  ${union[1]} offers ${banned}`)
      }
    }
  }
}

if (failures.length) {
  console.log(`FAIL verify api-vocabulary — ${failures.length} problem(s)\n`)
  for (const line of [...new Set(failures)].sort()) console.log(`  ${line}`)
  process.exit(1)
}
console.log(`PASS verify api-vocabulary — one state, tone and polymorphic vocabulary across ${files.length} files.`)
