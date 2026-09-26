import type * as React from "react"

/**
 * DirectionProvider — tells JS-positioned UI (menus, popovers) the writing direction; the
 * kit's CSS is logical (checked by tests/layout-faults.spec.ts; styles/map.css is the
 * exception). Also set `dir` on `<html>` so the browser handles selection, caret and scroll.
 */
import { DirectionProvider as DirectionPrimitive } from "@base-ui/react/direction-provider"

export interface DirectionProviderProps {
	direction?: "ltr" | "rtl"
	children?: React.ReactNode
}

export function DirectionProvider({ direction = "ltr", children }: DirectionProviderProps) {
	return <DirectionPrimitive direction={direction}>{children}</DirectionPrimitive>
}
