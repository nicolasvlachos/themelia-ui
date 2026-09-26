import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function HoverCardPage() {
	return (
		<ComponentPage>
			<Example
				example="hover-card/hover-card"
				title="HoverCard"
				description="A preview that opens on hover. Distinct from Tooltip in what it may CONTAIN: a tooltip is a short string and is not reachable, this is a surface with structure a reader can move into. That is why it has a close delay — the gap between trigger and card is exactly where the pointer travels to read it."
			/>

			<Example id="hover-card-rule" title="Hover is an accelerator">
				<Callout label="Rule">
					Nothing inside a <code>HoverCard</code> may be the only route to anything. Hover
					does not exist on touch, and a preview is a convenience for a pointer — the
					information in it has to be reachable by following the link it hangs off.
				</Callout>
			</Example>

			<Example id="hover-card-api" title="API">
				<PropTable owners={["HoverCardTrigger", "HoverCardContent"]} />
			</Example>
		</ComponentPage>
	)
}
