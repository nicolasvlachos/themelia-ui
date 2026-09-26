import { PlusIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"

export default function IconOnly() {
	return (
		<>
			<Button iconOnly aria-label="Add"><PlusIcon /></Button>
			<Button tone="neutral" buttonStyle="outline" iconOnly aria-label="Edit">✎</Button>
			<Button tone="destructive" buttonStyle="ghost" iconOnly aria-label="Delete">🗑</Button>
		</>
	)
}
