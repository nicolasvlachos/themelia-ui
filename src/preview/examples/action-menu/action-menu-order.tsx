import { PencilIcon, ShareIcon, TrashIcon } from "lucide-react"

import { ActionMenu, type ActionDefinition } from "themelia-ui/base/action-menu"
import { Stack } from "themelia-ui/base/structure"

/* Delete declared first on purpose: the example shows it moving last. */
const DESTRUCTIVE_FIRST: ActionDefinition[] = [
	{ label: "Delete", icon: TrashIcon, onClick: () => {}, tone: "destructive" },
	{ label: "Edit", icon: PencilIcon, onClick: () => {} },
	{ label: "Duplicate", icon: ShareIcon, onClick: () => {} },
]

export default function ActionMenuOrder() {
	return (
		// The same delete-first array: default ordering on the left, `preserveOrder` on the right.
		<Stack direction="horizontal" gap="lg" align="center">
			<ActionMenu
				actions={DESTRUCTIVE_FIRST}
				label="Sorted"
				buttonProps={{ tone: "neutral", buttonStyle: "outline" }}
			/>
			<ActionMenu
				actions={DESTRUCTIVE_FIRST}
				preserveOrder
				label="preserveOrder"
				buttonProps={{ tone: "neutral", buttonStyle: "outline" }}
			/>
		</Stack>
	)
}
