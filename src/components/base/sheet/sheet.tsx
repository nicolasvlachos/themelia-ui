/**
 * Sheet — an edge-anchored Overlay. `SheetContent` names the edge `side` and applies a
 * default shape; the other parts are Overlay's own (`base/overlay`). `modality` suits an
 * inspector that sits beside the app.
 */
import * as React from "react"

import { useDefaults } from "@/lib/ui-provider"

import {
	OverlayContent,
	type OverlayContentProps,
	type OverlayInset,
	type OverlayLength,
	type OverlaySize,
} from "@/components/base/overlay"
import { cx } from "@/lib/cx"

import type { SheetSide } from "./sheet.types"

export type { SheetSide }

// Default shape (flush, the default width); overridable per surface or once through the provider.
const SHEET_DEFAULTS = {
	side: "inline-end" as SheetSide,
	size: "default" as OverlaySize,
	length: "full" as OverlayLength,
	inset: false as OverlayInset,
}

export interface SheetContentProps
	extends Omit<OverlayContentProps, "placement">,
		Omit<React.ComponentProps<"dialog">, "children" | "className" | "title"> {
	/**
	 * The edge it enters from, as a logical side. `UIProvider` defaults can change it.
	 * @default "inline-end"
	 */
	side?: SheetSide
}

/**
 * OverlayContent at an edge. `side` is OverlayContent's `placement` minus centre — logical,
 * so it follows the writing mode — and the sheet adds a default shape: `side="inline-end"`,
 * `size="default"`, `length="full"` and `inset={false}`. `UIProvider`'s `defaults.sheet` takes
 * the same four, for a product that decides the shape once.
 *
 * `modality`, `surface`, `dismissal`, `initialFocusRef` and `showCloseButton` pass through
 * unchanged, with the Overlay defaults. A sheet is where `non-modal` earns its place: an
 * inspector you keep working beside.
 */
export function SheetContent({ side, size, length, inset, className, ...props }: SheetContentProps) {
	const defaults = useDefaults("sheet", SHEET_DEFAULTS)

	return (
		<OverlayContent
			placement={side ?? defaults.side}
			size={size ?? defaults.size}
			length={length ?? defaults.length}
			inset={inset ?? defaults.inset}
			className={cx("sheet--component", className)}
			{...props}
		/>
	)
}
