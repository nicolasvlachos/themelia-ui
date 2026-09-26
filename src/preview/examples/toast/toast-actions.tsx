import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

export default function ToastActions() {
	return (
		<Stack direction="horizontal" gap="sm" wrap>
			<Button
				buttonStyle="outline"
				tone="neutral"
				onClick={() =>
					toast("Invoice deleted", {
						description: "INV-4420 · Initech",
						duration: 8000,
						action: { label: "Undo", onClick: () => toast.success("Invoice restored") },
					})
				}
			>
				With undo
			</Button>
			<Button
				buttonStyle="outline"
				tone="neutral"
				onClick={() =>
					toast.warning("Discard unsaved changes?", {
						duration: Number.POSITIVE_INFINITY,
						action: { label: "Discard", onClick: () => toast("Changes discarded") },
						cancel: { label: "Keep", onClick: () => {} },
					})
				}
			>
				Pinned, two actions
			</Button>
		</Stack>
	)
}
