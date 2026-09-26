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

// Default shape (flush, `md` wide); overridable per surface or once through the provider.
const SHEET_DEFAULTS = {
	side: "inline-end" as SheetSide,
	size: "md" as OverlaySize,
	length: "full" as OverlayLength,
	inset: false as OverlayInset,
}

export interface SheetContentProps
	extends Omit<OverlayContentProps, "placement">,
		Omit<React.ComponentProps<"dialog">, "children" | "className" | "title"> {
	/** The edge it enters from. */
	side?: SheetSide
}

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
