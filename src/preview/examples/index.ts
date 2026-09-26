import type { ComponentType } from "react"

/**
 * Every preview example, keyed `<page>/<id>`: `badge/badge-tones` is
 * `examples/badge/badge-tones.tsx`. A file exports one default component and imports the
 * published subpaths, so the source shown in the Code tab is exactly what renders. Shared
 * data lives in a page folder's `data.ts`, shared JSX in files starting with `_`.
 */
export type ExampleEntry = { key: string; id: string; Demo: ComponentType; source: string }

const demos = import.meta.glob<{ default: ComponentType }>(["./*/*.tsx", "!./*/_*.tsx"], { eager: true })
const sources = import.meta.glob<string>(["./*/*.tsx", "!./*/_*.tsx"], { eager: true, query: "?raw", import: "default" })

const keyOf = (path: string) => path.replace(/^\.\//, "").replace(/\.tsx$/, "")

export const EXAMPLES: Record<string, ExampleEntry> = Object.fromEntries(
	Object.entries(demos).map(([path, module]) => {
		const key = keyOf(path)
		return [key, { key, id: key.split("/")[1] ?? key, Demo: module.default, source: (sources[path] ?? "").trimEnd() }]
	}),
)

export function exampleByKey(key: string): ExampleEntry {
	const entry = EXAMPLES[key]
	if (!entry) throw new Error(`No preview example "${key}" — expected src/preview/examples/${key}.tsx`)
	return entry
}
