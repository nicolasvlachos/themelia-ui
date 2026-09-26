import { CreditCardIcon } from "lucide-react"

import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "themelia-ui/base/item"

export default function ItemRuled() {
	return (
		<ItemGroup ruled style={{ width: "100%" }}>
			{[
				{ name: "Production", detail: "sk_live_••••0b3d" },
				{ name: "Staging", detail: "sk_test_••••a771" },
				{ name: "CI", detail: "sk_ci_••••e145" },
			].map((row) => (
				<Item key={row.name}>
					<ItemMedia variant="icon">
						<CreditCardIcon />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{row.name}</ItemTitle>
						<ItemDescription>{row.detail}</ItemDescription>
					</ItemContent>
				</Item>
			))}
		</ItemGroup>
	)
}
