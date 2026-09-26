import { PlusIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function IconOnly() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="center">
			<Button iconOnly aria-label="Add"><PlusIcon /></Button>
			<Button tone="neutral" buttonStyle="outline" iconOnly aria-label="Edit">✎</Button>
			<Button tone="destructive" buttonStyle="ghost" iconOnly aria-label="Delete">🗑</Button>
		</Stack>
	)
}
