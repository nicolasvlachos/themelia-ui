import { useState, type ReactNode } from "react"

import { UIPortalHostContext, type UIPortalContainer } from "./context"

export interface UIPortalHostProps {
	/** Portal into this element (a shadow root, an app-managed layer) instead of one the host renders. */
	container?: UIPortalContainer
	children: ReactNode
}

/**
 * Keeps popups inside this subtree, so they inherit the scope's custom properties and
 * `[data-density]` / `[data-theme]` attributes instead of the root's.
 *
 * ```tsx
 * <UIScope config={{ density: "compact", colorScheme: "dark" }}>
 *   <UIPortalHost>
 *     <DropdownMenu>…</DropdownMenu>
 *   </UIPortalHost>
 * </UIScope>
 * ```
 *
 * Opt-in per region; without a host, popups portal to the document as usual.
 */
export function UIPortalHost({ container, children }: UIPortalHostProps) {
	// State, not a ref, so children re-render once the target exists.
	const [rendered, setRendered] = useState<HTMLElement | null>(null)

	return (
		<UIPortalHostContext.Provider value={container ?? rendered}>
			{children}
			{container === undefined && (
				/* `display: contents`: no box, so no phantom flex or grid item. */
				<div ref={setRendered} data-slot="ui-portal-host" style={{ display: "contents" }} />
			)}
		</UIPortalHostContext.Provider>
	)
}
