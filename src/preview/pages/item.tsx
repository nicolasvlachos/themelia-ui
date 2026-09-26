import { CreditCardIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Card } from "@/components/base/cards"
import {
	Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia,
	ItemSeparator, ItemTitle,
} from "@/components/base/item"
import { Stack } from "@/components/base/structure"
import { Money, RelativeTime } from "@/components/primitives"
import { Scope } from "@/lib/ui-provider"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ItemPage() {
	return (
		<ComponentPage
			title="Item"
			summary="The row primitive that lists, menus, and tables compose. Media, content, and actions, with the media aligning to the first line whenever a description is present."
			importPath="@/components/base/item"
			exports={["Item", "ItemGroup", "ItemMedia", "ItemContent", "ItemTitle", "ItemDescription", "ItemActions", "ItemHeader", "ItemFooter", "ItemSeparator"
			]}
		>
			<Example
				id="item"
				title="Item"
				description="Every surface below is the same element: a list row, a menu row, a table row. That is why alignment, truncation, and the media-to-first-line rule are decided here once instead of three times — and why a surface prop, not a second component, is what makes one of them quieter."
				stacked
				code={`<ItemGroup>
  <Item>
    <ItemMedia variant="image"><Avatar /></ItemMedia>
    <ItemContent>
      <ItemTitle>Jane McDonald</ItemTitle>
      <ItemDescription>jane@example.com</ItemDescription>
    </ItemContent>
    <ItemActions><Badge>Active</Badge></ItemActions>
  </Item>
</ItemGroup>`}
			>
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
			</Example>

			<Example
				id="cards-scale"
				title="Density"
				description="Neither Card nor Item takes a size prop. Density is scoped instead, so a dense list can sit inside a normally-scaled card."
				stacked
				code={`<Scope vars={{ "--density-scale": 0.85 }}>
  <ItemGroup>…</ItemGroup>
</Scope>`}
			>
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
			</Example>

			<Example
				id="item-ruled"
				title="A ruled group"
				description="A group's default gap is right for a list of independent things — search results, a feed — where each row is its own object. Inside one card it is wrong: at a rem apart, three cart lines or three secrets read as three unrelated blocks, and the card grows a third taller than its content needs. ruled swaps the air for a hairline, and drops a neutral row's own inline padding, which exists to hold a row off a surface it is not drawing. The rule is painted as a positioned pseudo-element, not a border: a row carries a radius for its hover ground, and a border follows the box it is on — the hairline came out with a quarter-arc hooking down at each end."
				stacked
				code={`<ItemGroup ruled>
  <Item>…</Item>
  <Item>…</Item>
</ItemGroup>`}
			>
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
			</Example>

			<Example id="item-rule" title="Rows are Items" stacked>
				<Callout label="Rule">
					A list row, a menu row, and a table row are the same shape: something on the
					left, a title with optional supporting text, controls on the right. They share
					one primitive so that alignment, truncation, and the media-to-first-line rule
					are decided once instead of three times.
				</Callout>
			</Example>

			<Example id="item-api" title="API">
				<PropTable owner="Item"
					rows={[
						{ name: "surface", type: '"neutral" | "bordered" | "muted"', default: '"neutral"', description: "Row chrome. Never 'default' — the vocabulary is fixed." },
						{ name: "ItemGroup ruled", type: "boolean", default: "false", description: "Hairlines instead of gaps, and neutral rows go flush. For a run of rows inside one card, where a rem of air between each reads as unrelated blocks. bordered and muted rows keep their inset, because they do draw a surface." },
						{ name: "ItemMedia variant", type: '"icon" | "image"', description: "Sizes the leading slot. image gets the larger box an avatar or thumbnail needs." },
						{ name: "ItemContent", type: "component", description: "Title and description. Takes the remaining width and truncates rather than pushing the actions off the row." },
						{ name: "ItemActions", type: "component", description: "Trailing controls. Kept out of the content flow so a long title cannot displace them." },
						{ name: "ItemGroup", type: "component", description: "Stacks rows and owns the dividers, so a row never draws its own." },
						{ name: "--density-scale", api: ["css:--density-scale"], type: "number", default: "var(--scale)", description: "Global density factor. Scope it so a dense list can sit inside a normally-scaled card." },
						{ name: "ItemHeader / ItemFooter", type: "component", description: "Full-width rows above and below the row\u2019s own content, for an item that carries an eyebrow or a footnote without them competing with the title line." },
						{ name: "ItemSeparator", type: "component", description: "A rule between items, for a group that wants one only in places. `ItemGroup ruled` is the answer when every row needs one." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
