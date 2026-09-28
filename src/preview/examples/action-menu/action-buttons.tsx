import { ArchiveIcon, DownloadIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react"

import { ActionButtons, type ActionDefinition } from "themelia-ui/base/action-menu"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

import { QUIET } from "./data"

const TOOLBAR: ActionDefinition[] = [
	{ label: "Edit", icon: PencilIcon, onClick: () => {} },
	{ label: "Duplicate", icon: ShareIcon, ...QUIET, onClick: () => {} },
	{ label: "Export", icon: DownloadIcon, ...QUIET, onClick: () => {} },
	{ label: "Archive", icon: ArchiveIcon, ...QUIET, onClick: () => {} },
	{ label: "Delete", icon: TrashIcon, appearance: "outline", tone: "destructive", onClick: () => {} },
]

export default function ActionButtonsExample() {
	return (
		<Stack style={{ width: "100%" }}>
			{[5, 3, 1].map((max) => (
				<Stack key={max} gap="sm">
					<Text size="xs" type="secondary">max={max}</Text>
					<ActionButtons actions={TOOLBAR} max={max} />
				</Stack>
			))}
		</Stack>
	)
}
