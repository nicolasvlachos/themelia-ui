import { InboxIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import {
	DocumentStackIllustration,
	Empty,
	InboxCleanIllustration,
	SearchGlassIllustration,
	StackedCardsIllustration,
	UsersCircleIllustration,
} from "@/components/base/feedback"
import { Grid, Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const ILLUSTRATIONS = [
	{ name: "StackedCardsIllustration", Component: StackedCardsIllustration, use: "no records" },
	{ name: "DocumentStackIllustration", Component: DocumentStackIllustration, use: "invoices, reports, files" },
	{ name: "UsersCircleIllustration", Component: UsersCircleIllustration, use: "people" },
	{ name: "InboxCleanIllustration", Component: InboxCleanIllustration, use: "all caught up" },
	{ name: "SearchGlassIllustration", Component: SearchGlassIllustration, use: "nothing matches" },
]

export function EmptyPage() {
	return (
		<ComponentPage
			title="Empty state"
			summary="What to show when there is nothing to show. It names the absence and offers the next step — an empty state that only explains is a dead end."
			importPath="@/components/base/feedback"
			exports={["Empty", "StackedCardsIllustration", "SearchGlassIllustration", "DocumentStackIllustration", "InboxCleanIllustration", "UsersCircleIllustration"
			]}
		>
			<Example
				id="empty"
				title="Empty"
				description="Centred and measure-limited, because an empty state is the whole surface — left-aligned text across the full width reads as a broken layout rather than a message."
				stacked
				code={`<Empty
  media={<InboxIcon />}
  mediaVariant="icon"
  title="No invoices yet"
  description="Invoices appear here once a customer is billed."
  action={<Button>Create invoice</Button>}
/>`}
			>
				<Empty
					media={<InboxIcon />}
					mediaVariant="icon"
					title="No invoices yet"
					description="Invoices appear here once a customer is billed. Nothing has been sent on this account."
					action={
						<>
							<Button>Create invoice</Button>
							<Button tone="neutral" buttonStyle="outline">
								Import
							</Button>
						</>
					}
					footer="Imported invoices keep their original numbering."
				/>
			</Example>

			<Example
				id="empty-media"
				title="How the media is dressed"
				description="Four treatments of one slot. icon puts a glyph in a muted tile; icon-soft is the same tile, quieter, for a glyph that illustrates rather than reports; illustration drops the chrome entirely, because an illustration brings its own canvas and a tile around it is a frame around a frame."
				stacked
				code={`<Empty mediaVariant="icon" media={<SearchIcon />} … />
<Empty mediaVariant="illustration" media={<SearchGlassIllustration />} … />`}
			>
				<Grid columns={{ base: 1, md: 3 }} gap="xl">
					<Empty
						padding="sm"
						border
						mediaVariant="icon"
						media={<SearchIcon />}
						title="icon"
						description="A glyph in a muted tile."
					/>
					<Empty
						padding="sm"
						border
						mediaVariant="icon-soft"
						media={<SearchIcon />}
						title="icon-soft"
						description="The same tile, quieter."
					/>
					<Empty
						padding="sm"
						border
						mediaVariant="illustration"
						media={<SearchGlassIllustration />}
						title="illustration"
						description="No chrome, and room below."
					/>
				</Grid>
			</Example>

			<Example
				id="empty-illustrations"
				title="The illustration set"
				description="Five compositions built from the theme's own surface, fill, and line tokens — which is why they are divs rather than SVG files. An exported illustration is a picture of one theme; these follow a retheme and both modes without a second asset."
				stacked
				code={`import { StackedCardsIllustration } from "themelia-ui/base/feedback"

<Empty
  mediaVariant="illustration"
  media={<StackedCardsIllustration />}
  title="No products yet"
/>`}
			>
				<Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="2xl">
					{ILLUSTRATIONS.map(({ name, Component, use }) => (
						<Stack key={name} gap="md" align="center">
							<Component />
							<Stack gap="none" align="center">
								<Text size="sm" weight="medium">{name}</Text>
								<Text size="xs" type="secondary">{use}</Text>
							</Stack>
						</Stack>
					))}
				</Grid>
			</Example>

			<Example
				id="empty-border"
				title="padding and border"
				description="Three paddings, because an empty state in a side panel is a paragraph in a narrow column and the same component on a page is the whole viewport. border draws the dashed outline — for a state standing in for a card body, where the dashed edge says “something goes here”, not merely for any region that happens to be bare."
				stacked
				code={`<Empty padding="sm" border title="No filters" description="…" />`}
			>
				<Stack gap="xl">
					<Empty padding="sm" border media={<InboxIcon />} mediaVariant="icon" title="padding=&quot;sm&quot;" description="A side panel, a table cell, a card body." />
					<Empty padding="lg" media={<InboxIcon />} mediaVariant="icon" title="padding=&quot;lg&quot;" description="A whole page, with no border." />
				</Stack>
			</Example>

			<Example id="empty-rule" title="Density and padding" stacked>
				<Callout label="Rule">
					<code>padding</code> does <strong>not</strong> read the provider&rsquo;s density.
					Density already reaches these tokens through <code>--density-scale</code>, so a
					compact scope shrinks every padding step on its own. Reading density here as
					well would apply it twice — the double-factor bug{" "}
					<code>verify factors</code> exists to catch.
				</Callout>
			</Example>
			<Example id="empty-api" title="API">
				<PropTable owner="Empty"
					rows={[
						{ name: "title", type: "ReactNode", description: "Names the absence. 'No invoices yet', not 'Nothing here'. Falls back to strings.title so a bare <Empty /> still renders during scaffolding." },
						{ name: "description", type: "ReactNode | false", description: "Why it is empty, or what will fill it. `false` hides it, for a title that already tells the story." },
						{ name: "media / mediaVariant", type: "ReactNode / \"none\" | \"icon\" | \"icon-soft\" | \"illustration\"", default: '"none"', description: "The visual and its chrome. `none` renders the media raw." },
						{ name: "renderMedia", type: "(ctx) => ReactNode", description: "Media as a function of the variant, for a visual that changes with the chrome around it." },
						{ name: "action", type: "ReactNode", description: "The next step. An empty state that only explains is a dead end." },
						{ name: "footer", type: "ReactNode", description: "Quiet copy under the action — a hint, a learn-more, a shortcut." },
						{ name: "padding", type: '"sm" | "md" | "lg"', default: '"md"', description: "Breathing room, on both axes. The inline padding is what keeps copy off a dashed edge." },
						{ name: "border", type: "boolean", default: "false", description: "The dashed outline." },
						{ name: "strings", type: "Partial<EmptyStrings>", description: "title, description, and ariaLabel. The region announces through role=\"status\", so a list that empties out while the reader is on the page says so." },
						{ name: "DocumentStackIllustration / InboxCleanIllustration / UsersCircleIllustration", type: "component", description: "The rest of the set. Each is drawn from the theme\u2019s own tokens rather than shipped as an image, so an empty state cannot be the one thing on the page that ignores a rebrand \u2014 and it costs no request." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
