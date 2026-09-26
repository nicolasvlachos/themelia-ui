import { DateBlock } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"

export default function DateBlockExample() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="start">
			<DateBlock date="2026-08-16" />
			<DateBlock date="2026-12-31" />
			<DateBlock date="2027-01-04" showYear />
			<DateBlock date="2026-09-28" time="09:00" />
		</Stack>
	)
}
