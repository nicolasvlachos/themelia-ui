import { CreditCardIcon } from "lucide-react"

import { IconBadge } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"

export default function IconBadgeExample() {
	return (
		<Stack gap="xl">
			<Stack direction="horizontal" gap="lg" wrap align="center">
				{(["neutral", "primary", "success", "warning", "destructive", "info"] as const).map(
					(tone) => (
						<IconBadge key={tone} icon={CreditCardIcon} tone={tone} />
					),
				)}
			</Stack>
			<Stack direction="horizontal" gap="lg" wrap align="center">
				{(["neutral", "primary", "success", "warning", "destructive", "info"] as const).map(
					(tone) => (
						<IconBadge key={tone} icon={CreditCardIcon} tone={tone} shape="circle" solid />
					),
				)}
			</Stack>
		</Stack>
	)
}
