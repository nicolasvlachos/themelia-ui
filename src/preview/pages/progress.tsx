import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ProgressPage() {
	return (
		<ComponentPage>
			<Example
				example="progress/progress"
				title="Progress"
				description="Determinate by default. Without a value it becomes a travelling band, because a bar frozen at some width reads as stalled progress rather than unknown progress."
			/>

			<Example
				example="progress/progress-circle"
				title="ProgressCircle"
				description="The same measurement as a ring, with the figure inside it. A bar is right when it has a row to itself and a label beside it; a ring is right in a tile or a grid of small measures, where a bar would need a caption to say what it was measuring and the caption is the only thing there is room for. The hole is masked rather than covered by a smaller disc, because a base component cannot know what surface it was dropped onto. Size comes from `--progress-circle`, not a prop."
			/>

			<Example id="progress-accessibility" title="Accessibility">
				<Callout>
					Progress reports its real bounds, and drops the ARIA value attributes entirely
					when indeterminate: announcing 0% when the number is unknown is worse than
					announcing nothing. Both presentations clamp finite values to the range,
					resolve non-finite values to 0, and fall back to a maximum of 100 when max is
					not finite and positive, so ARIA and the visual fill always agree.
				</Callout>
			</Example>

			<Example id="progress-api" title="API">
				<PropTable owners={["Progress", "ProgressCircle"]} />
			</Example>
		</ComponentPage>
	)
}
