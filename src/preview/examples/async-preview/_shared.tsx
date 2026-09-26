import { Avatar, AvatarFallback } from "themelia-ui/base/avatar"
import { Badge } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Email, Money, RelativeTime, formatInitials } from "themelia-ui/primitives"

import type { Customer } from "./data"

export function CustomerCard({ customer }: { customer: Customer }) {
	return (
		<Stack gap="md">
			<Stack direction="horizontal" gap="sm" align="center">
				<Avatar>
					<AvatarFallback>{formatInitials(customer.name)}</AvatarFallback>
				</Avatar>
				<Stack gap="none">
					<Text weight="medium">{customer.name}</Text>
					<Email value={customer.email} />
				</Stack>
			</Stack>
			<Stack direction="horizontal" gap="sm" align="center" wrap>
				<Badge tone="neutral">{customer.plan}</Badge>
				<Money amount={customer.spend} currency="USD" size="sm" />
				<Text size="xs" type="secondary">
					seen <RelativeTime value={customer.lastSeen} size="xs" type="inherit" />
				</Text>
			</Stack>
		</Stack>
	)
}
