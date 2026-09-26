import { useContext, useEffect, useMemo, useRef, type ReactNode } from "react"

import { UIConfigContext, UINestedContext, mergeUIConfig } from "./context"
import { configToAttributes } from "./tokens"
import type { UIConfig } from "./types"
import { useIPhoneInputZoom } from "./use-iphone-input-zoom"

/** Where a root may mirror its attributes, or `false` to leave the document alone. */
export type UIDocumentTarget = "documentElement" | "body" | false

export interface UIRootProps {
	/** The application's defaults. Merged over the library's own. */
	config?: UIConfig
	/**
	 * Which element gets the theme and density attributes, or `false` (default) for none.
	 * Opt-in because it writes outside the tree, which could fight another root or an app's
	 * own `data-theme`; it is the only way a root can theme the page canvas.
	 */
	documentTarget?: UIDocumentTarget
	children: ReactNode
}

/** A target a root can actually write to. */
type UIDocumentElementTarget = Exclude<UIDocumentTarget, false>

/** Every attribute a root may write; fixed so a handoff can clear the previous owner's. */
const OWNED_ATTRIBUTES = ["data-theme", "data-density", "data-iphone-input-zoom"] as const

interface DocumentRequest {
	/** Mount order. The oldest live request for a target owns it. */
	order: number
	target: UIDocumentElementTarget
	attributes: Record<string, string | undefined>
}

/*
 * Roots that asked for a document target. The oldest live request owns it, so an unmount
 * hands the target to the next root in line. Ordered by a sequence taken once per root, so
 * a config change cannot send a root to the back of the queue.
 */
const requests = new Map<symbol, DocumentRequest>()
let sequence = 0

/** What a target looked like before the FIRST request for it arrived. */
const snapshots = new Map<UIDocumentElementTarget, Map<string, string | null>>()

function elementFor(target: UIDocumentElementTarget): HTMLElement | null {
	if (typeof document === "undefined") return null
	return target === "body" ? document.body : document.documentElement
}

/** Make one target match its owner, or restore it if none is left. Targets are independent. */
function reconcileTarget(target: UIDocumentElementTarget) {
	const element = elementFor(target)
	if (!element) return

	let owner: DocumentRequest | null = null
	for (const request of requests.values()) {
		if (request.target !== target) continue
		if (owner === null || request.order < owner.order) owner = request
	}

	if (owner === null) {
		// Restore, not remove: give back any theme the application had set itself.
		for (const [name, value] of snapshots.get(target) ?? []) {
			if (value === null) element.removeAttribute(name)
			else element.setAttribute(name, value)
		}
		snapshots.delete(target)
		return
	}

	if (!snapshots.has(target)) {
		// Once, before the first write; per-root snapshots would record another root's theme.
		snapshots.set(
			target,
			new Map(OWNED_ATTRIBUTES.map((name) => [name, element.getAttribute(name)] as const)),
		)
	}

	for (const name of OWNED_ATTRIBUTES) {
		const value = owner.attributes[name]
		if (value == null) element.removeAttribute(name)
		else element.setAttribute(name, value)
	}
}

/**
 * `<UIRoot>` — the application's configuration, once. Renders no element; region scoping
 * is `UIScope`, which does.
 */
export function UIRoot({ config, documentTarget = false, children }: UIRootProps) {
	const parent = useContext(UIConfigContext)
	const resolved = useMemo(() => mergeUIConfig(parent, config), [parent, config])
	const preventIPhoneZoom = useIPhoneInputZoom(resolved.forms?.preventIPhoneZoom)
	const identity = useRef<symbol | null>(null)
	identity.current ??= Symbol("ui-root")

	// Queue position, held here: the effect's cleanup deletes the registry entry first.
	const order = useRef<number | null>(null)
	order.current ??= sequence++

	useEffect(() => {
		if (documentTarget === false || typeof document === "undefined") return

		const target: UIDocumentElementTarget = documentTarget
		const identifier = identity.current as symbol

		requests.set(identifier, {
			order: order.current as number,
			target,
			attributes: { ...configToAttributes(resolved), "data-iphone-input-zoom": String(preventIPhoneZoom) },
		})
		reconcileTarget(target)

		return () => {
			requests.delete(identifier)
			// The target this effect claimed; `documentTarget` may have changed since.
			reconcileTarget(target)
		}
	}, [documentTarget, resolved, preventIPhoneZoom])

	return (
		<UIConfigContext.Provider value={resolved}>
			<UINestedContext.Provider value={true}>{children}</UINestedContext.Provider>
		</UIConfigContext.Provider>
	)
}
