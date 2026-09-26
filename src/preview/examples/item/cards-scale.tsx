import { Card } from "themelia-ui/base/cards"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "themelia-ui/base/item"
import { Stack } from "themelia-ui/base/structure"
import { Scope } from "themelia-ui/ui-provider"

export default function CardsScale() {
	return (
		<Stack gap="lg" style={{ width: "100%" }}>
			{[1, 0.85].map((scale) => (
				<Scope key={scale} vars={{ "--density-scale": scale }}>
					<Card surface="bordered" title={`--density-scale ${scale}`}>
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
				</Scope>
			))}
		</Stack>
	)
}
