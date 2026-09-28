import { Stack } from "themelia-ui/base/structure"
import { UploadTray } from "themelia-ui/base/upload"

import { QUEUE } from "./data"

export default function UploadTrayExample() {
	const items = QUEUE

	return (
		<Stack gap="sm" style={{ maxWidth: "34rem", width: "100%" }}>
			<UploadTray
				items={items}
				onAddFiles={() => {}}
				onRetry={() => {}}
				onRemove={() => {}}
				onClearAll={() => {}}
			/>
		</Stack>
	)
}
