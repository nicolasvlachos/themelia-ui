import type * as React from "react"

/**
 * DirectionProvider — tells JS-positioned UI (menus, popovers) the writing direction; the
 * kit's CSS is logical (checked by tests/layout-faults.spec.ts; styles/map.css is the
 * exception). Also set `dir` on `<html>` so the browser handles selection, caret and scroll.
 */
import { DirectionProvider as DirectionPrimitive } from "@base-ui/react/direction-provider"

export interface DirectionProviderProps {
	/**
	 * The reading direction for a subtree, as the menus, popovers and other script-positioned
	 * parts inside it read it. The kit's CSS is logical and follows the `dir` attribute, so
	 * set `dir` on the region as well for its layout to mirror.
	 */
	direction?: "ltr" | "rtl"
	children?: React.ReactNode
}

/**
 * Tells script-positioned UI — menus, popovers — the writing direction of a subtree. Set
 * `dir` on `<html>` or the region as well, so the browser handles selection, caret and
 * scroll, and the kit's logical CSS mirrors.
 */
export function DirectionProvider({ direction = "ltr", children }: DirectionProviderProps) {
	return <DirectionPrimitive direction={direction}>{children}</DirectionPrimitive>
}
