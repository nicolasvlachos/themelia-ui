/*
 * Proves each vocabulary rule fires on its own defect: mutates Progress (small, with a tone
 * union) once per rule and restores it in `finally`.
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync, copyFileSync, renameSync } from "node:fs"
const T = "src/components/base/feedback/progress.tsx"
const B = "src/components/base/feedback/.progress.backup"
const run = () => { try { execFileSync("node",["scripts/verify-api-vocabulary.mjs"],{encoding:"utf8",stdio:["ignore","pipe","pipe"]}); return {failed:false,out:""} } catch(e){ return {failed:true,out:`${e.stdout??""}${e.stderr??""}`} } }
copyFileSync(T,B)
const cases = [
  ["default-pair", (s)=>s.replace("  value?: number", "  value?: number\n\tdefaultValue?: number")],
  ["state-triplet", (s)=>s.replace("  value?: number", "  value?: number\n\topen?: boolean")],
  ["polymorphic",  (s)=>s.replace("  value?: number", "  value?: number\n\tas?: React.ElementType")],
  ["banned-tone",  (s)=>s.replace('export type ProgressTone = "primary"','export type ProgressTone = "error" | "primary"')],
]
let bad = 0
try {
  for (const [rule, mutate] of cases) {
    const src = readFileSync(B,"utf8").replace(/\tvalue\?: number/, "  value?: number")
    writeFileSync(T, mutate(src))
    const r = run(); const ok = r.failed && r.out.includes(rule)
    console.log(`  ${ok?"caught ":"MISSED "} ${rule}`); if(!ok) bad++
  }
} finally { renameSync(B,T) }
if (bad) {
  console.log(`\nFAIL verify api-vocabulary self-test — ${bad} rule(s) did not fire`)
  process.exit(1)
}
console.log(`\nPASS verify api-vocabulary self-test — all ${cases.length} rules fire on their own defect.`)
