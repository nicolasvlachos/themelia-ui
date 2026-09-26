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
				<PropTable owner="SharedResourceCard"
					rows={[
						{ name: "resource", type: "TResource | null", required: true, description: "The persisted assignment. null is the only empty state; hasResource is derived from it and never independently controlled." },
						{ name: "selector", type: "SelectorConfig", description: "The picker, its copy, and the write. Omit it and the card is read-only — no change action, and an empty state that offers nothing." },
						{ name: "selector.SelectorComponent", type: "ComponentType<SelectorProps>", required: true, description: "Yours. It receives selected, onSelect, and inModal — a picker that adapts inside a dialog can read the last one." },
						{ name: "selector.mapInitialSelected", type: "(resource) => TSuggestion | null", required: true, description: "Turns the persisted resource into a starting choice, so “Change” opens on what the record holds." },
						{ name: "selector.onConfirmSelection", type: "(selection) => void | Promise", required: true, description: "Persists it. A returned promise is awaited and drives the confirming state; a rejection keeps the dialog open and reaches onError." },
						{ name: "selector.isConfirmDisabled", type: "(selection) => boolean", description: "Refuses a pending choice — an inactive venue, a room too small. The confirm stays disabled rather than failing after the press." },
						{ name: "selector.getSelectionLabel", type: "(selection) => ReactNode", description: "How the choice reads in the summary above the buttons. Without it the card looks for a string `label` field, which is a guess — a cheap and usually right one." },
						{ name: "renderResourceContent / ResourceContentComponent / sections", type: "ladder", description: "The assigned body, most specific first. A render prop closes over local state, a component is reusable, and sections are data — each rung exists because the one below it is wrong for someone." },
						{ name: "actions", type: "ActionDefinition[]", description: "Extra overflow actions. Alone, the change action is a header button; alongside these it joins them — two triggers side by side is worse than one menu holding both." },
						{ name: "viewAction / viewLink", type: "ReactNode / { href, label }", description: "The router-neutral slot and the native-anchor convenience. Both render only when a resource is assigned." },
						{ name: "useSharedResourceCard", type: "hook", description: "The state machine without the card: open state, pending choice, canConfirmSelection, and a confirm that awaits." },
						{ name: "DefaultDialogContent", type: "component", description: "The picker the assignment dialog shows when a consumer supplies none. Exported so a custom dialog can keep it and add to it, rather than starting from nothing." },
						{ name: "DefaultDialogSummary", type: "component", description: "What is about to be committed, restated above the confirm. A picker can scroll, and the chosen row is often out of sight by the time the reader reaches the button." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
