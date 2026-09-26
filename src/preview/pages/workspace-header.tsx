import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function WorkspaceHeaderPage() {
	return (
		<ComponentPage>
			<Example
				example="workspace-header/record-header"
				title="WorkspaceRecordHeader"
				description="Media, a status, metadata pairs, and two tiers of action. Each metadata pair is one inline item, label and value together, so a screen reader reads “Owner: Jane McDonald” as one fact rather than two loose strings."
			/>

			<Example
				example="workspace-header/record-header-secondary"
				title="Two tiers of action"
				description="Primary actions pin to the title row, where they are read as belonging to the record. The secondary row beneath is for controls that change the VIEW of it — a tab bar, a filter, a bulk selection — which belong to the screen rather than to the thing."
			/>

			<Example id="record-header-rule" title="A record is not a page">
				<Callout label="Rule">
					Use <code>PageHeading</code> when the answer to “what is this?” is a screen, and
					this when it is a row in a table somewhere. Folding both into one component would
					mean a page title growing an avatar prop, a status prop, and a metadata prop it
					never uses — and every page paying the cost of the ones that do.
				</Callout>
			</Example>

			<Example id="record-header-api" title="API">
				<PropTable owner="WorkspaceRecordHeader" />
				<PropTable symbols={["WorkspaceLayout", "WorkspaceNav", "WorkspaceLocaleStrip"]} />
			</Example>
		</ComponentPage>
	)
}
