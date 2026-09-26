import { DateBlock } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"

export default function DateBlockParts() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="start">
			<DateBlock date="2026-09-02" showWeekday={false} />
			<DateBlock date="2026-09-02" showMonth={false} />
			<DateBlock date="2026-09-02" showYear />
			<DateBlock date="2026-09-02" time="09:00 – 10:30" />
		</Stack>
	)
}
