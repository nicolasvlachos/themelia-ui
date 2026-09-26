import {
	ArchiveIcon, ChevronDownIcon, DownloadIcon, PencilIcon, ShareIcon, TrashIcon,
} from "lucide-react"

import { ActionMenu } from "themelia-ui/base/action-menu"
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function ActionMenuWidth() {
	return (
		<Stack direction="horizontal" gap="xl" align="center" wrap>
			<ActionMenu
				label="Shortcuts"
				actions={[
					{ label: "Edit", icon: PencilIcon, shortcut: "⌘E", onClick: () => {} },
					{ label: "Duplicate", icon: ShareIcon, shortcut: "⌘D", onClick: () => {} },
					{ label: "Export as CSV", icon: DownloadIcon, shortcut: "⌘⇧E", onClick: () => {} },
					{ label: "Delete", icon: TrashIcon, shortcut: "⌫", onClick: () => {}, tone: "destructive" },
				]}
			/>
			<ActionMenu
				label="Descriptions"
				actions={[
					{ label: "Edit", icon: PencilIcon, description: "Change the name and the billing address.", onClick: () => {} },
					{ label: "Export", icon: DownloadIcon, description: "CSV, one row per invoice.", onClick: () => {} },
					{ label: "Delete", icon: TrashIcon, description: "Permanent. Invoices are kept for seven years.", onClick: () => {}, tone: "destructive" },
				]}
				maxWidth="20rem"
			/>
			<ActionMenu
				label="Fixed 280px"
				width={280}
				actions={[
					{ label: "A short one", onClick: () => {} },
					{ label: "A considerably longer label that would otherwise set the width", onClick: () => {} },
				]}
			/>
			<ActionMenu
				renderTrigger={
					<Button buttonStyle="outline" tone="neutral" style={{ width: "16rem" }}>
						Matches the trigger
						<ChevronDownIcon />
					</Button>
				}
				width="trigger"
				actions={[
					{ label: "Edit", icon: PencilIcon, onClick: () => {} },
					{ label: "Archive", icon: ArchiveIcon, onClick: () => {} },
				]}
			/>
		</Stack>
	)
}
