import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CardPage() {
	return (
		<ComponentPage
			title="Card"
			summary="The single surface primitive. Every framed region in the kit is one — if Card does not expose the chrome you need, extend it rather than introducing a second card."
			importPath="@/components/base/cards"
			exports={["Card", "CardHeader", "CardContent", "CardFooter", "CardActionStrip", "CardPrimaryAction", "CardSkeleton"
			]}
		>
			<Example
				example="card/card-surfaces"
				title="Surfaces"
				description="Outer chrome. Framed is the default: a bezel — an outer hairline, a quiet band as wide as the gap between the two radii, an inner hairline, then the surface, whose corner is the small radius by construction. card is the plain panel, bordered drops the fill, and flat is a card in structure only, for a region that must not look like a panel."
			/>

			<Example
				example="card/card-slots"
				title="Slots"
				description="Slot-driven rather than composed: title, description, actions, and footerText cover the shape almost every card takes, so the common case is props rather than six nested elements."
			/>

			<Example
				example="card/card-expandable"
				title="Expandable"
				description="Clips to a collapsed height with a fade rather than a hard cut — a clean edge reads as the end of the content, which is exactly the wrong signal when there is more of it."
			/>

			<Example id="cards-rule" title="One card primitive">
				<Callout label="Rule">
					Every framed region in the kit is a <code>Card</code>. Nothing else grows
					card-shaped chrome, because a parallel wrapper is how two “cards” end up with
					different radii and shadows. If Card does not expose the chrome you need, extend
					it rather than introducing a second one.
				</Callout>
			</Example>

			<Example
				example="card/card-header-slots"
				title="Header slots"
				description="The title line takes a leading icon, a suffix for badges and counts, an info affordance for the sentence that would make the description too long, and a control at the end. Everything is optional and the row collapses to whatever is present."
			/>

			<Example
				example="card/card-alert"
				title="Alert band"
				description="A banner between the header and the content, for something about this card rather than about the page. A plain string is wrapped in an Alert for you; pass a node when it needs an action."
			/>

			<Example
				example="card/card-actions"
				title="Actions, and the whole card as one"
				description="CardActionStrip lays a card&rsquo;s actions out from one array, so the first is the primary and the rest follow without each call site deciding again. CardPrimaryAction is the other approach: it makes the WHOLE card one link by stretching an anchor across it, which keeps the card a single tab stop instead of a grid of them — nested controls still work, because they sit above it."
			/>

			<Example
				example="card/card-skeleton"
				title="CardSkeleton"
				description="Reserves the card&rsquo;s box while its content loads. It takes the same `surface` as the card it stands in for, and a line count, because a placeholder of the wrong shape moves the page twice — once when it appears and once when it is replaced."
			/>

			<Example id="card-api" title="API">
				<PropTable owner="Card"
					rows={[
						{ name: "surface", type: '"card" | "framed" | "flat" | "bordered"', default: '"framed"', description: "Outer chrome. framed, the bezel, is the default; card is the plain panel. Change it for a whole product once with UIProvider defaults.card.surface." },
						{ name: "title / description", type: "ReactNode", description: "Header copy. The title truncates rather than pushing header controls off the row." },
						{ name: "titleSuffix", type: "ReactNode", description: "Badges, status, or counts immediately after the title." },
						{ name: "titleLevel", type: "1 | 2 | 3 | 4 | 5 | 6", description: "Renders the title as that heading, for a card that heads a page or a region. Unset, the title is styled text and outlines nothing." },
						{ name: "media", type: "ReactNode", description: "A full-bleed strip above the header — a cover image, a map, a brand band — clipped to the card's top corners." },
						{ name: "actions", type: "ActionDefinition[]", description: "Overflow commands, rendered by the shared ActionMenu. A destructive entry moves last and is separated." },
						{ name: "headerAction", type: "ReactNode", description: "A single control at the end of the header. Use actions for a list of commands." },
						{ name: "alert", type: "ReactNode | string", description: "Banner between header and content. A plain string is wrapped in an Alert." },
						{ name: "footerText / footerSlot", type: "ReactNode", description: "The footer band. Muted text and a control." },
						{ name: "tooltip", type: "ReactNode", description: "Explanatory copy behind an info affordance on the title line. A real focusable button, not a title attribute — `strings.tooltip` names it." },
						{ name: "alertTone", type: "AlertTone", default: '"neutral"', description: "Tone of the alert band." },
						{ name: "headerStart / headerEnd", type: "ReactNode", description: "A full-width row above the title, and metadata before the header controls." },
						{ name: "contentTop / contentBottom", type: "ReactNode", description: "Content inside the content inset, around children." },
						{ name: "headerDivider / footerDivider", type: "boolean", default: "false", description: "Rules between the regions." },
						{ name: "expandable", type: "boolean | { collapsedMaxHeight }", default: "false", description: "Clips content to a collapsed height with a fade, and adds a toggle. The object form sets the height for this card only." },
						{ name: "expanded / defaultExpanded / onExpandedChange", type: "boolean", description: "Controlled and uncontrolled expansion." },
						{ name: "strings", type: "Partial<CardStrings>", description: "Overrides this card's own copy — the info glyph, the overflow trigger, and the disclosure control's name in each state." },
						{ name: "CardActionStrip actions / align / separator / fullWidthPrimary", type: "ActionDefinition[] / …", description: "One array decides which action is primary and how the rest follow, so a page of cards cannot disagree about it. separator rules the strip off from the content; fullWidthPrimary is for a card whose action is the point." },
						{ name: "CardPrimaryAction href / label", type: "string", description: "Stretches an anchor across the whole card, so the card is one tab stop rather than a grid of them. The label is the accessible name — the visible title is not necessarily the destination." },
						{ name: "CardSkeleton surface / showHeader / lines", type: "CardSurface / boolean / number", description: "Reserves the real card\u2019s box. Matching the surface and the line count is the whole job: a placeholder of the wrong shape moves the page twice." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
