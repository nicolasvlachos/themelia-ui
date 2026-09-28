import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { ConfirmDialog } from "themelia-ui/features/overlays"

import { wait } from "./data"

export default function ConfirmDialogExample() {
	return (
		<Stack direction="horizontal" wrap>
			<ConfirmDialog
				title="Discard your changes?"
				description="The draft has unsaved edits."
				trigger={<Button tone="neutral" appearance="outline">Neutral</Button>}
			/>
			<ConfirmDialog
				destructive
				title="Delete this invoice?"
				description="INV-4417 will be removed from the workspace."
				alertMessage="This cannot be undone."
				trigger={<Button tone="destructive">Destructive</Button>}
				onAsyncConfirm={() => wait(900)}
			/>
		</Stack>
	)
}
