import { Badge } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"

export default function BadgeDot() {
	return (
		<Stack direction="horizontal" gap="sm" wrap>
			<Badge tone="success" dot>Live</Badge>
			<Badge tone="warning" dot pending>Queued</Badge>
			<Badge tone="info" dot pulse>Syncing</Badge>
			<Badge tone="destructive" dot>Failed</Badge>
		</Stack>
	)
}
