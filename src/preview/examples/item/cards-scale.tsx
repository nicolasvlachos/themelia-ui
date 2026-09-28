import { Card } from "themelia-ui/base/cards"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "themelia-ui/base/item"
import { Stack } from "themelia-ui/base/structure"
import { UIScope } from "themelia-ui/ui-provider"

export default function CardsScale() {
	return (
		<Stack style={{ width: "100%" }}>
			{(["default", "compact"] as const).map((density) => (
				<UIScope key={density} config={{ density }}>
					<Card surface="bordered" title={`density="${density}"`}>
						<ItemGroup>
							<Item surface="bordered">
								<ItemContent>
									<ItemTitle>First row</ItemTitle>
									<ItemDescription>Supporting detail.</ItemDescription>
								</ItemContent>
							</Item>
							<Item surface="bordered">
								<ItemContent>
									<ItemTitle>Second row</ItemTitle>
									<ItemDescription>Supporting detail.</ItemDescription>
								</ItemContent>
							</Item>
						</ItemGroup>
					</Card>
				</UIScope>
			))}
		</Stack>
	)
}
