import { de } from "date-fns/locale"

import { Calendar } from "themelia-ui/base/date-pickers"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIProvider } from "themelia-ui/ui-provider"

const MARCH = new Date("2026-03-01T00:00:00")

export default function CalendarLocale() {
	return (
		<Stack direction="horizontal" gap="2xl" wrap align="start">
			<Stack gap="xs" align="start">
				<Text size="xs" type="secondary">built-in, Monday first</Text>
				<Calendar mode="single" month={MARCH} />
			</Stack>
			<Stack gap="xs" align="start">
				<Text size="xs" type="secondary">dates: {"{ locale: de, weekStartsOn: 0 }"}</Text>
				<UIProvider config={{ dates: { locale: de, weekStartsOn: 0 } }}>
					<Calendar mode="single" month={MARCH} />
				</UIProvider>
			</Stack>
		</Stack>
	)
}
