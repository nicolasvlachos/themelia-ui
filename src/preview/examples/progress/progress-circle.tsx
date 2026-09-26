import { ProgressCircle } from "themelia-ui/base/feedback"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ProgressCircleExample() {
	return (
		<Stack direction="horizontal" gap="lg" wrap>
			{[
				{ value: 24, tone: undefined },
				{ value: 60, tone: "info" as const },
				{ value: 72, tone: "warning" as const },
				{ value: 100, tone: "success" as const },
				{ value: 12, tone: "destructive" as const },
			].map((row) => (
				<ProgressCircle
					key={row.value}
					value={row.value}
					tone={row.tone}
					label={`${row.value} percent`}
				>
					<Text tag="span" size="xs" weight="semibold" numeric lineHeight="none">
						{row.value}%
					</Text>
				</ProgressCircle>
			))}
		</Stack>
	)
}
