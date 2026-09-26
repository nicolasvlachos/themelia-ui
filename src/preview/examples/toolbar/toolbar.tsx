import { BoldIcon, ItalicIcon, Redo2Icon, Undo2Icon } from "lucide-react"

import { Stack } from "themelia-ui/base/structure"
import {
	Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarLink, ToolbarSeparator,
} from "themelia-ui/base/toolbar"

export default function ToolbarExample() {
	return (
		<Stack direction="horizontal">
			<Toolbar aria-label="Formatting">
				<ToolbarGroup>
					<ToolbarButton iconOnly aria-label="Bold">
						<BoldIcon />
					</ToolbarButton>
					<ToolbarButton iconOnly aria-label="Italic">
						<ItalicIcon />
					</ToolbarButton>
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToolbarGroup>
					<ToolbarButton iconOnly aria-label="Undo">
						<Undo2Icon />
					</ToolbarButton>
					<ToolbarButton iconOnly aria-label="Redo" disabled>
						<Redo2Icon />
					</ToolbarButton>
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToolbarInput aria-label="Font size" defaultValue="14" inputMode="numeric" style={{ width: "calc(4rem * var(--scale))" }} />
				<ToolbarLink
					href="#/toolbar"
					onClick={(event) => {
						event.preventDefault()
						document.getElementById("toolbar-api")?.scrollIntoView({ behavior: "smooth" })
					}}
				>
					API
				</ToolbarLink>
			</Toolbar>
		</Stack>
	)
}
