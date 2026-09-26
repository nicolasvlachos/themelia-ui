import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ResourceAssignmentPage() {
	return (
		<ComponentPage>
			<Example
				example="resource-assignment/assigned"
				title="With a resource"
				description="Press Change: the dialog opens on what is currently assigned, the summary restates the pending choice above the buttons, and confirming waits for the write before it closes. The body here comes from sections — data, which is what a screen assembling its panel from a config actually has."
			/>

			<Example
				example="resource-assignment/empty"
				title="With none"
				description="`resource === null` is the only empty state — the card never tracks “assigned” separately from the thing itself. Without a picker the empty state says so plainly and offers nothing; with one it offers the assign action, and the label switches from Change to Assign on its own."
			/>

			<Example
				example="resource-assignment/retry"
				title="Rejected write and retry"
				description="The first confirmation rejects. The dialog stays open, the selected venue remains visible, and the same confirmation can be retried successfully. The error is surfaced through onError in the card's existing alert seam."
			/>

			<Example id="assignment-rules" title="Two types, and where the choice comes from">
				<Callout label="Rule">
					<code>TResource</code> is what is <strong>persisted</strong>; <code>TSuggestion</code> is
					what the picker offers. They are separate because the round trip is: pick a suggestion,
					confirm it, and the server answers with a resource. Collapsing them would force every
					consumer to make their search results look like their stored records.
				</Callout>
				<Text size="sm" type="secondary">
					On each open the pending choice comes from one of three places, in order: a controlled{" "}
					<code>value</code>, then — on the <strong>first</strong> open only — an explicit{" "}
					<code>defaultValue</code>, then <code>mapInitialSelected(resource)</code>. Without the
					first-open restriction a default would override the assignment every time the dialog
					reopened, and “Change” would keep forgetting what the record actually holds.
				</Text>
				<Text size="sm" type="secondary">
					Closing is refused while the write is in flight, and a rejected write leaves the dialog
					open with the choice intact — the reader has to be able to see what failed and try again.
				</Text>
			</Example>

			<Example id="assignment-api" title="API">
				<PropTable owners={["SharedResourceCard", "SharedResourceCardSelectorConfig"]} />
				<PropTable symbols={["useSharedResourceCard", "DefaultDialogContent", "DefaultDialogSummary"]} />
			</Example>
		</ComponentPage>
	)
}
