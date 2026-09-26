import { Stack } from "themelia-ui/base/structure"
import { UploadProgressList } from "themelia-ui/base/upload"

import { QUEUE } from "./data"

export default function UploadQueue() {
	const items = QUEUE

	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<UploadProgressList items={items} onRetry={() => {}} onRemove={() => {}} />
		</Stack>
	)
}
