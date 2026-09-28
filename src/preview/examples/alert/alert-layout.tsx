import { SearchXIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "themelia-ui/base/feedback"

export default function AlertLayout() {
	return (
		<>
			<Alert tone="destructive" icon={<SearchXIcon />}>
				<AlertTitle>With a leading icon</AlertTitle>
				<AlertDescription>The grid becomes two columns automatically.</AlertDescription>
			</Alert>
			<Alert tone="info">
				<AlertTitle>With an action</AlertTitle>
				<AlertDescription>Inline space is reserved on the trailing edge.</AlertDescription>
				<AlertAction>
					<Button tone="neutral" appearance="ghost">
						Undo
					</Button>
				</AlertAction>
			</Alert>
			<Alert>
				<AlertTitle>Neither — single column</AlertTitle>
				<AlertDescription>No icon, no action, no reserved space.</AlertDescription>
			</Alert>
		</>
	)
}
