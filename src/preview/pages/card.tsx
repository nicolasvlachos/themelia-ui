import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CardPage() {
	return (
		<ComponentPage>
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
				<PropTable owners={["Card", "CardActionStrip", "CardPrimaryAction", "CardSkeleton"]} />
			</Example>
		</ComponentPage>
	)
}
