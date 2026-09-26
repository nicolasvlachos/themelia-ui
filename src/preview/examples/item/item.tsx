import { CreditCardIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import {
	Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator,
	ItemTitle,
} from "themelia-ui/base/item"
import { Money, RelativeTime } from "themelia-ui/primitives"

export default function ItemExample() {
	return (
		<ItemGroup style={{ width: "100%" }}>
			{[
				{ name: "Northwind Traders", detail: "Invoice #4417", amount: 1299.5 },
				{ name: "Acme Corporation", detail: "Invoice #4418", amount: 84 },
			].map((row, index) => (
				<Item key={row.name} surface={index === 0 ? "bordered" : "neutral"}>
					<ItemMedia variant="icon">
						<CreditCardIcon />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{row.name}</ItemTitle>
						<ItemDescription>
							{row.detail} · <RelativeTime value="2026-08-20T00:00:00Z" />
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Money amount={row.amount} />
						<Badge tone="neutral">Paid</Badge>
					</ItemActions>
				</Item>
			))}
			<ItemSeparator />
			<Item surface="muted">
				<ItemContent>
					<ItemTitle>Muted surface</ItemTitle>
					<ItemDescription>For a de-emphasised row.</ItemDescription>
				</ItemContent>
			</Item>
		</ItemGroup>
	)
}
