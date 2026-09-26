import { CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import {
	ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup,
	ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut,
	ContextMenuTrigger,
} from "themelia-ui/base/context-menu"
import { Text } from "themelia-ui/base/typography"

export default function ContextMenuExample() {
	const [contextDense, setContextDense] = useState(false)

	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					<div
						style={{
							display: "grid",
							placeItems: "center",
							width: "100%",
							minHeight: "8rem",
							border: "1px dashed var(--border)",
							borderRadius: "var(--radius)",
						}}
					/>
				}
			>
				<Text type="secondary">Right-click anywhere in this panel</Text>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuGroup>
					{/* `inset` puts rows without an icon on the same label column as rows with one. */}
					<ContextMenuLabel inset>Invoice</ContextMenuLabel>
					<ContextMenuItem icon={<PencilIcon />}>
						Edit <ContextMenuShortcut>⌘E</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem icon={<CopyIcon />}>Duplicate</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuCheckboxItem inset checked={contextDense} onCheckedChange={setContextDense}>
					Dense rows
				</ContextMenuCheckboxItem>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive" icon={<Trash2Icon />}>
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
