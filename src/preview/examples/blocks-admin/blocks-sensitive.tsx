import { KeyRoundIcon } from "lucide-react"

import { SensitiveAction } from "themelia-ui/blocks/admin/access"
import { Button } from "themelia-ui/base/buttons"

export default function BlocksSensitive() {
	return (
		<SensitiveAction
			title="Delete this workspace"
			description="Removes the workspace and everything inside it."
			confirmation="Every dashboard, data source and saved view goes with it. This cannot be undone."
			icon={KeyRoundIcon}
			action={<Button tone="destructive">Delete workspace</Button>}
		/>
	)
}
