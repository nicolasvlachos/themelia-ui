import { DateBlock } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function DateBlockUnboxed() {
	return (
		<Stack>
			<Stack direction="horizontal" wrap align="start">
				<DateBlock date="2026-08-27" boxed={false} />
				<DateBlock date="2026-08-27" boxed={false} showWeekday={false} />
			</Stack>
			<Stack direction="horizontal" gap="sm" align="baseline">
				<Text size="sm" type="secondary">Next session</Text>
				<DateBlock date="2026-08-27" layout="inline" time="· 09:00" />
			</Stack>
		</Stack>
	)
}
