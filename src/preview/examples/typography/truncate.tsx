import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function Truncate() {
	return (
		<Stack id="truncate-demo" gap="sm" style={{ maxWidth: "26rem", width: "100%", borderInline: "1px dashed var(--border)" }}>
			<Text truncate>
				A file name long enough that it cannot fit the width the caller allotted it
			</Text>
			<Text tag="span" size="xs" type="secondary" truncate>
				key_live_9f2c4b1e77a0d3f8b6c5a41d0e73b28c9f4610d7a2b8e5c1904f6d3b7e28a05c
			</Text>
			<Text>
				Without it the same string wraps to as many lines as it needs, which is right
				for prose and wrong for a row that has to hold its height.
			</Text>
		</Stack>
	)
}
