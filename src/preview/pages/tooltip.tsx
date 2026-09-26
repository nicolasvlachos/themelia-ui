import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TooltipPage() {
	return (
		<ComponentPage>
			<Example
				example="tooltip/tooltip"
				title="Tooltip"
				description="The trigger has to be a real focusable element, so the tip opens on keyboard focus and not only on hover."
			/>

			<Example id="tooltip-rule" title="Never the only copy">
				<Callout label="Rule">
					A tooltip cannot be opened on a touch screen and disappears the moment the
					pointer moves, so nothing a reader NEEDS may live only here. It is for the
					second sentence, not the first. An icon-only control still needs its own{" "}
					<code>aria-label</code> — the tip is not a substitute for a name.
				</Callout>
			</Example>

			<Example id="tooltip-api" title="API">
				<PropTable owners={["TooltipTrigger", "TooltipContent", "TooltipProvider", "TooltipButton"]} />
			</Example>
		</ComponentPage>
	)
}
