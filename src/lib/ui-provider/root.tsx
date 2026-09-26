import { useContext, useEffect, useMemo, useRef, type ReactNode } from "react"

import { UIConfigContext, UINestedContext, mergeUIConfig } from "./context"
import { configToAttributes } from "./tokens"
import type { UIConfig } from "./types"
import { useIPhoneInputZoom } from "./use-iphone-input-zoom"

/** Where a root may mirror its attributes, or `false` to leave the document alone. */
export type UIDocumentTarget = "documentElement" | "body" | false

export interface UIRootProps {
	/**
	 * The application's defaults, merged over the library's own. Resolution is component
	 * prop → nearest scope → root config → component fallback.
	 */
	config?: UIConfig
	/**
	 * Which element gets the theme and density attributes, or `false` (default) for none.
	 * Explicit on purpose: mirroring onto the document is the only way a root can own the
	 * page canvas, and it is also the only thing here that touches state outside the tree. A
	 * component that reaches for the document unasked fights the next React root, the next
	 * test, and any app already managing its own `data-theme`.
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
 *
 * It restores, never removes: it captures what each attribute was before it mounted and
 * puts it back on unmount. Deleting them instead would take an app's own theme with it
 * whenever a provider unmounted inside that app.
 *
 * One owner, handed on: two independent React roots — a host app and an embedded widget —
 * both think they are the top. Each asks for the document and the OLDEST root still mounted
 * owns it; the rest leave it alone. When the owner unmounts the document goes to the next
 * root in line rather than reverting, so a widget still on the page is still honoured.
 * `body` and `documentElement` are tracked separately, and a final unmount restores what
 * was there before the first root arrived — not what the previous owner wrote.
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
