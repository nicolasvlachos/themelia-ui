import { PlusIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function IconOnly() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<Button iconOnly aria-label="Add"><PlusIcon /></Button>
			<Button tone="neutral" appearance="outline" iconOnly aria-label="Edit">✎</Button>
			<Button tone="destructive" appearance="ghost" iconOnly aria-label="Delete">🗑</Button>
		</Stack>
	)
}
