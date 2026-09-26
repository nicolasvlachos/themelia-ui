/**
 * The server-render sweep, one family at a time. Used only by `ssr-surface.test.tsx`
 * (the `-test-utils` suffix marks that).
 */
import { createElement } from "react"
import { renderToString } from "react-dom/server"

export interface SsrFamily {
	id: string
	source: string
}

export interface SsrFamilyResult {
	familyId: string
	/** False when the module could not be loaded at all, for any reason. */
	imported: boolean
	/** How many capitalised callables were rendered — the sweep's non-vacuity signal. */
	rendered: number
	/** Only failures that name a browser global. Everything else is the caller's problem. */
	hazards: string[]
}

/**
 * An error a consumer cannot fix: a browser global read during import or render, which
 * breaks SSR builds. Missing-prop throws are expected and ignored.
 */
export const BROWSER_GLOBAL =
	/\b(window|document|navigator|localStorage|sessionStorage|matchMedia|HTMLElement|Element|self)\b[^\n]*is not defined|Cannot read propert(?:y|ies).*of undefined \(reading '(?:document|window|navigator)'\)/i

export async function renderFamilyWithoutBrowser(family: SsrFamily): Promise<SsrFamilyResult> {
	const result: SsrFamilyResult = { familyId: family.id, imported: false, rendered: 0, hazards: [] }
	const specifier = `/${family.source.replace(/\.ts$/, "")}.ts`

	let module: Record<string, unknown>
	try {
		module = (await import(/* @vite-ignore */ specifier)) as Record<string, unknown>
	} catch (error) {
		const message = String((error as Error)?.message ?? error)
		result.hazards.push(
			BROWSER_GLOBAL.test(message)
				? `${family.id}: importing it reaches a browser global — ${message.slice(0, 90)}`
				: `${family.id}: could not be imported at all — ${message.slice(0, 80)}`,
		)
		return result
	}
	result.imported = true

	for (const [name, value] of Object.entries(module)) {
		/* A component, not a hook or a constant: capitalised and callable. */
		if (typeof value !== "function" || !/^[A-Z]/.test(name)) continue
		result.rendered++
		try {
			renderToString(createElement(value as never))
		} catch (error) {
			const message = String((error as Error)?.message ?? error)
			if (BROWSER_GLOBAL.test(message)) result.hazards.push(`${family.id} ${name}: ${message.slice(0, 90)}`)
		}
	}

	return result
}
