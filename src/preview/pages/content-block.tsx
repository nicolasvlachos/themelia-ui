import { CreditCardIcon, KeyRoundIcon, ShieldCheckIcon, TruckIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import {
	ContentBlock, IconBadge, PlaceholderPattern, Separator,
} from "@/components/base/display"
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/base/item"
import { DirectionProvider } from "@/components/base/direction"
import { Slot } from "@/components/base/slot"
import { Grid, GridCell, Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ContentBlockPage() {
	return (
		<ComponentPage
			title="Content block & icon badge"
			summary="ContentBlock is a titled region that is NOT a Card — a labelled group inside one — and it owns the four surfaces a region can take. IconBadge is the kit's glyph-in-a-medallion, the mark that sits at the head of one. DateBlock has a page of its own."
			importPath="@/components/base/display"
			exports={["ContentBlock", "IconBadge", "PlaceholderPattern", "DirectionProvider", "Slot"
			]}
		>
			<Example
				id="content-block-surfaces"
				title="Four surfaces"
				description="What separates them is what the block sits ON. `plain` has no chrome at all — a heading and its content. `bordered` is a ruled region and the page shows through it. `muted` sinks into the page. `card` lifts off it. Six regions across the blocks layer had written a border, the surface radius and `--card` into their own modules before `card` existed; they now say surface=&quot;card&quot; and keep only their own rhythm."
				stacked
				code={`<ContentBlock surface="card" title="Contract" description="…">
  …
</ContentBlock>`}
			>
				<Grid columns={{ base: 1, sm: 2 }} gap="lg">
					{(["plain", "bordered", "muted", "card"] as const).map((surface) => (
						<GridCell key={surface}>
							<ContentBlock
								surface={surface}
								icon={<ShieldCheckIcon aria-hidden="true" />}
								title={`surface="${surface}"`}
								description="The header renders only when there is something to put in it."
							>
								<Text size="xs" type="secondary">
									A block with no title, description, icon or headerEnd draws no header at all —
									which is what makes it usable as a bare surface.
								</Text>
							</ContentBlock>
						</GridCell>
					))}
				</Grid>
			</Example>

			<Example
				id="content-block-flush"
				title="flush"
				description="Drops the surface's inset and clips to its radius, for content that has to reach the border. A strip of hairline-divided cells or a group of ruled rows reads as one module only if the rules meet the edge; paid by the block, each rule would stop short and every band would float. The children pay the inset instead."
				stacked
				code={`<ContentBlock surface="card" flush>
  <ItemGroup ruled>…</ItemGroup>
</ContentBlock>`}
			>
				<Grid columns={2} gap="lg">
					<GridCell>
						<ContentBlock surface="card" flush>
							<ItemGroup ruled>
								{[
									{ name: "Production", value: "sk_live_••••0b3d" },
									{ name: "Staging", value: "sk_test_••••a771" },
								].map((row) => (
									<Item key={row.name} style={{ paddingInline: "var(--space-xl)" }}>
										<ItemMedia>
											<IconBadge icon={KeyRoundIcon} />
										</ItemMedia>
										<ItemContent>
											<ItemTitle>{row.name}</ItemTitle>
											<Text size="xs" type="secondary">
												{row.value}
											</Text>
										</ItemContent>
									</Item>
								))}
							</ItemGroup>
						</ContentBlock>
					</GridCell>
					<GridCell>
						<ContentBlock
							surface="card"
							title="Not flush"
							titleSuffix={<Badge tone="neutral">for contrast</Badge>}
						>
							<Text size="xs" type="secondary">
								The block pays the inset here, so nothing inside it can touch the border. Right
								for prose and for a stack of controls; wrong for a run of ruled rows.
							</Text>
						</ContentBlock>
					</GridCell>
				</Grid>
			</Example>

			<Example
				id="content-block-header"
				title="The header assembles itself"
				description="icon, title, titleSuffix and headerEnd each render only when supplied, and the header row appears only if at least one of them does. A block is therefore a bare surface, a titled region, or a titled region with a control — without a variant prop deciding which."
				stacked
				code={`<ContentBlock
  icon={<TruckIcon />}
  title="Shipment"
  titleSuffix={<Badge tone="info">In transit</Badge>}
  headerEnd={<Button buttonStyle="ghost">Track</Button>}
/>`}
			>
				<Stack gap="lg">
					<ContentBlock
						surface="card"
						icon={<TruckIcon aria-hidden="true" />}
						title="Shipment"
						titleSuffix={<Badge tone="info">In transit</Badge>}
						headerEnd={
							<Button tone="neutral" buttonStyle="ghost">
								Track
							</Button>
						}
						description="A description is its own row, so a long one wraps under the whole header rather than squeezing the title."
					>
						<Separator />
						<Text size="xs" type="secondary">
							Children follow, spaced by the block's own gap.
						</Text>
					</ContentBlock>
				</Stack>
			</Example>

			<Example
				id="icon-badge"
				title="IconBadge"
				description="A glyph in a tinted medallion. The tone sets a PAIR — a low-alpha fill and a full-strength glyph — declared together in CSS rather than as two props, so a badge cannot end up with one tone's ground and another's ink. `solid` inverts the pair for the one badge that has to be found at a glance. Five components had hand-drawn this before, each ten lines, two of them minting a size token that resolved to the badge's own."
				stacked
				code={`<IconBadge icon={CreditCardIcon} tone="success" />
<IconBadge icon={CreditCardIcon} tone="success" shape="circle" solid />`}
			>
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
			</Example>

			<Example
				id="placeholder-pattern"
				title="PlaceholderPattern"
				description="Diagonal hatching for a region with nothing in it yet — a chart slot before data, a layout being described rather than filled. It reads as deliberately empty, which a blank box does not: a blank box reads as broken."
				stacked
				code={`<PlaceholderPattern style={{ height: "8rem" }} />`}
			>
				<PlaceholderPattern style={{ height: "8rem", borderRadius: "var(--radius)" }} />
			</Example>

			<Example
				id="direction-slot"
				title="DirectionProvider and Slot"
				description="Two utilities with no appearance of their own. DirectionProvider sets the reading direction for a subtree, so a right-to-left region can sit inside a left-to-right page and every logical property in the kit follows it. Slot is the merge helper behind `render`: it puts a component&rsquo;s props and ref onto the single element it is given, which is how a trigger becomes your own Button rather than one the family styles."
				stacked
				code={`<DirectionProvider direction="rtl">
  <Stack>…</Stack>
</DirectionProvider>

// Consumers normally use a component’s render prop.
// Slot is the lower-level merge helper for wrapper authors:
<Slot data-context="example">
  <Text>Props are merged onto this child.</Text>
</Slot>`}
			>
				<Stack gap="lg">
					<DirectionProvider direction="rtl">
						<ContentBlock surface="card" title="اتجاه من اليمين إلى اليسار">
							<Text size="xs" type="secondary">
								Every inset, gap and border in this block is a logical property, so the whole
								region mirrors from one prop rather than from a stylesheet per direction.
							</Text>
						</ContentBlock>
					</DirectionProvider>
					<Slot className={undefined}>
						<Text size="xs" type="secondary">
							Slot renders its child, merged. There is nothing of its own on the page.
						</Text>
					</Slot>
				</Stack>
			</Example>

			<Example id="content-block-rule" title="Not a Card" stacked>
				<Callout label="Rule">
					A Card is a panel; a ContentBlock is a labelled group inside one. Using a Card for
					both is how a settings page ends up with cards nested three deep, each drawing its
					own border and shadow. When a region needs the card's ground without the card's
					header machinery, that is <code>surface=&quot;card&quot;</code>.
				</Callout>
			</Example>

			<Example id="content-block-api" title="API">
				<PropTable owner="ContentBlock"
					rows={[
						{ name: "surface", type: '"plain" | "bordered" | "muted" | "card"', default: '"plain"', description: "Outer chrome. What separates bordered from card is the ground: a bordered block is a ruled region and the page shows through it; a card block lifts off it." },
						{ name: "flush", type: "boolean", default: "false", description: "Drops the inset and clips to the radius, for content that runs to the edge. Only meaningful on a surface that has an inset to drop." },
						{ name: "title / description", type: "ReactNode", description: "Either one renders the header; neither, and the block is a bare surface. The description is its own row, so a long one wraps under the whole header." },
						{ name: "icon / titleSuffix / headerEnd", type: "ReactNode", description: "Leading glyph, content immediately after the title (a badge, a count), and controls at the end of the title line." },
						{ name: "--content-block-p / --content-block-gap", api: ["css:--content-block-p", "css:--content-block-gap"], type: "token", description: "Optional local inset override and the gap between children. By default, framed blocks follow --surface-x and --surface-y; --content-block-p overrides both axes when explicitly set." },
						{ name: "IconBadge icon", type: "ComponentType | ReactNode", description: "A component or a rendered node. A component is called with aria-hidden, because the badge is a mark beside a name that already says it." },
						{ name: "IconBadge tone / solid / shape", type: 'IconBadgeTone / boolean / "rounded" | "circle"', default: '"neutral" / false / "rounded"', description: "Tone sets fill and glyph together so the two cannot come from different tones. solid inverts the pair. Size comes from `--icon-badge-size`, so a caller needing a smaller mark re-points the token instead of redrawing the badge." },
						{ name: "PlaceholderPattern", type: "component", description: "Diagonal hatching for a region with nothing in it yet. It reads as deliberately empty; a blank box reads as broken." },
						{ name: "DirectionProvider direction", type: '"ltr" | "rtl"', default: '"ltr"', description: "The reading direction for a subtree. Every measurement in the kit is a logical property, so a region mirrors from this one prop." },
						{ name: "Slot", type: "component", description: "The merge helper behind `render`: props and ref onto the single element. Ported rather than depended on \u2014 it is one function, and a package for it is a package to keep." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
