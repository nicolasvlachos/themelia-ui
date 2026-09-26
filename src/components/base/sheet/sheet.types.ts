import type {
	OverlayInset, OverlayLength, OverlayPlacement, OverlaySize,
} from "@/components/base/overlay"

/** The edge a sheet enters from, in writing-mode-relative terms. */
export type SheetSide = Exclude<OverlayPlacement, "center">

declare module "@/lib/ui-provider" {
	interface ComponentDefaults {
		/**
		 * Sheet defaults, e.g. `defaults: { sheet: { length: "95%", inset: true } }`.
		 * Registered here so adding a family never edits `lib/`.
		 */
		sheet: {
			side: SheetSide
			size: OverlaySize
			length: OverlayLength
			inset: OverlayInset
		}
	}
}
