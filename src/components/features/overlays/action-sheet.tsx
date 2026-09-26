/**
 * ActionSheet — `ActionDialog`'s recipe over `base/sheet`, for longer work: a filter rail,
 * an inspector, a long form. Shares ActionOverlayFrame; its own are the edge props (side,
 * size, length, inset, modality) and a body that always renders to fill the edge.
 */
import { SheetContent } from "@/components/base/sheet"

import { ActionOverlayFrame, type ActionOverlayParts } from "./action-overlay-frame"
import type { ActionSheetProps } from "./overlays.types"

const PARTS = {
	Content: SheetContent as ActionOverlayParts["Content"],
} satisfies ActionOverlayParts

export function ActionSheet({
	side = "inline-end",
	size,
	length,
	inset,
	modality = "modal",
	showFooter = true,
	...props
}: ActionSheetProps) {
	return (
		<ActionOverlayFrame
			{...props}
			parts={PARTS}
			hook="action-sheet"
			alwaysRenderBody
			showFooter={showFooter}
			contentProps={() => ({ side, size, length, inset, modality })}
		/>
	)
}
