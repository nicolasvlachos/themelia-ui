import type { OverlayPlacement } from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"

import { Demo } from "./_shared"

export default function OverlayPlacementExample() {
	return (
		<Stack direction="horizontal" gap="sm" wrap>
			{(
				["center", "inline-start", "inline-end", "block-start", "block-end"] as OverlayPlacement[]
			).map((placement) => (
				<Demo key={placement} label={placement} placement={placement} />
			))}
		</Stack>
	)
}
