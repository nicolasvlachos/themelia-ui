import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TimelinePage() {
	return (
		<ComponentPage>
			<Example
				example="timeline/timeline-default"
				title="An order's progress"
				description="Each entry carries a status, and the connector below it takes the same tone — so a run of completed steps reads as one finished stretch rather than as separate dots on a neutral thread."
			/>

			<Example
				example="timeline/timeline-statuses"
				title="Statuses"
				description="Progress states first, then outcomes. `pending` is the only one that describes an absence, which is why it is the only unfilled dot."
			/>

			<Example
				example="timeline/timeline-content"
				title="Entries that carry more than a line"
				description="`children` hangs anything under the description — a badge row, a diff, an action. The rail keeps its geometry regardless of how tall an entry grows, because the connector fills the space rather than being offset into it."
			/>

			<Example
				id="timeline-props"
				title="Props"
				description="One prop. Everything an entry needs travels in the item, so a caller composing a timeline from its own records maps once rather than threading props through."
			>
				<Callout>
					The rail is <code>aria-hidden</code>. Its tone repeats what the entry already says in
					words and the icon is chosen for recognition rather than meaning, so announcing it
					would put noise between every two entries. Anything a reader must know belongs in
					the title or the description.
				</Callout>
				<PropTable owners={["Timeline", "TimelineItem"]} />
			</Example>
			<Example
				example="timeline/stepper-default"
				title="Stepper"
				description="A numbered sequence the reader is partway through: a numeral that becomes a tick, a connector to the next step, a label and an optional hint. StepsBar and BreadcrumbProgress both draw with it, so the markers, the connectors and the state rules are decided once. `bar` sets the label under a ringed marker in an equal column; `trail` sets it beside a filled marker and folds it away below lg."
				bleed
			/>

			<Example
				example="timeline/stepper-pressable"
				title="Going back a step"
				description="`onStepClick` turns each step into a button. Finished steps and the current one are reachable; upcoming ones are disabled, because a wizard that lets you skip ahead past a step you have not filled in is not a wizard. The caller owns the position — the stepper only reports the press."
			/>

			<Example
				id="stepper-props"
				title="Stepper props"
				description="Position and state are said in words as well as drawn: each step announces what its numeral counts, and a finished or current step says so, so neither the tick nor the tone is the only signal."
			>
				<Callout>
					The current step carries <code>aria-current="step"</code> — on its button when steps are
					pressable, because that is where focus lands, and on the list item otherwise. The
					marker and the connectors are <code>aria-hidden</code>.
				</Callout>
				<PropTable owners={["Stepper", "StepperStep"]} />
			</Example>
		</ComponentPage>
	)
}
