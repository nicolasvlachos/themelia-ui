import { Redo2Icon, Undo2Icon } from "lucide-react"

import { Stack } from "themelia-ui/base/structure"
import { Toolbar, ToolbarButton } from "themelia-ui/base/toolbar"

export default function ToolbarOrientation() {
	return (
		<Stack direction="horizontal" gap="xl" align="start">
			<Toolbar aria-label="History" orientation="vertical">
				<ToolbarButton iconOnly aria-label="Undo">
					<Undo2Icon />
				</ToolbarButton>
				<ToolbarButton iconOnly aria-label="Redo">
					<Redo2Icon />
				</ToolbarButton>
			</Toolbar>
		</Stack>
	)
}
