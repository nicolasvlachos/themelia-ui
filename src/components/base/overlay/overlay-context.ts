import { createContext, useContext, type MutableRefObject } from "react"

export type OverlayContextValue = {
	open: boolean
	setOpen: (open: boolean) => void
	/**
	 * Registered by OverlayContent so `setOpen` can correct the element directly: the native
	 * `close` event is async, and a same-value state update would not re-render.
	 */
	reconcileRef: MutableRefObject<((next: boolean) => void) | null>
	/** Ids of the mounted title and description; each registers only while mounted. */
	titleId: string | undefined
	descriptionId: string | undefined
	setTitleId: (id: string | undefined) => void
	setDescriptionId: (id: string | undefined) => void
}

export const OverlayContext = createContext<OverlayContextValue | null>(null)

/** The context when present, for parts that also render outside an Overlay. */
export function useOptionalOverlayContext(): OverlayContextValue | null {
	return useContext(OverlayContext)
}

export function useOverlayContext(part: string): OverlayContextValue {
	const context = useContext(OverlayContext)
	if (!context) throw new Error(`<${part}> must be used within <Overlay>`)
	return context
}
