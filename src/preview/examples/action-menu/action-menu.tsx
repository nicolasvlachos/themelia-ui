import { useState } from "react"
import {
	ArchiveIcon, ChevronDownIcon, DownloadIcon, PencilIcon, SettingsIcon, ShareIcon, TrashIcon,
} from "lucide-react"

import { ActionMenu, type ActionDefinition } from "themelia-ui/base/action-menu"
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function ActionMenuExample() {
	const [showArchived, setShowArchived] = useState(false)

	const actions: ActionDefinition[] = [
		{ label: "Edit", icon: PencilIcon, onClick: () => {} },
		{ label: "Duplicate", icon: ShareIcon, onClick: () => {} },
		{
			group: "View",
			label: "Show archived",
			type: "checkbox",
			checked: showArchived,
			onCheckedChange: setShowArchived,
		},
		{ label: "Export as CSV", icon: DownloadIcon, onClick: () => {} },
		{ label: "Archive", icon: ArchiveIcon, onClick: () => {}, group: true },
		{ label: "Delete", icon: TrashIcon, onClick: () => {}, tone: "destructive" },
	]

	return (
		<Stack direction="horizontal" gap="xl" align="center">
			<ActionMenu actions={actions} />
			<ActionMenu actions={actions} label="Actions" icon={SettingsIcon} />
			<ActionMenu
				actions={actions}
				renderTrigger={
					<Button buttonStyle="outline" tone="neutral">
						Custom trigger
						<ChevronDownIcon />
					</Button>
				}
			/>
		</Stack>
	)
}
