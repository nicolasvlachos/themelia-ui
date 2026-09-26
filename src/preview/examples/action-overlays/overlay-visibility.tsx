import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import {
	ActionDialog, ConfirmDialog, useOverlayVisibilityGroup,
} from "themelia-ui/features/overlays"

export default function OverlayVisibility() {
	const overlays = useOverlayVisibilityGroup(["edit", "remove"] as const, {
		closeOthersOnOpen: true,
	})

	return (
		<>
			<Stack direction="horizontal" gap="lg" wrap>
				<Button tone="neutral" buttonStyle="outline" onClick={overlays.edit.show}>
					Open edit
				</Button>
				<Button tone="neutral" buttonStyle="outline" onClick={overlays.remove.show}>
					Open remove
				</Button>
			</Stack>

			<ActionDialog
				{...overlays.edit.overlayProps}
				title="Edit"
				description="Opened from the button beside this one, not from a trigger."
			/>
			<ConfirmDialog
				{...overlays.remove.overlayProps}
				destructive
				title="Remove?"
				description="Opening this one closes the other — closeOthersOnOpen."
			/>
		</>
	)
}
