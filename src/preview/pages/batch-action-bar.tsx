import { Stack } from "@/components/base/structure"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BatchActionBarPage() {
	return (
		<ComponentPage>
			<Example
				example="batch-action-bar/floating"
				title="Floating"
				description="Docks to the bottom centre of the viewport, so it stays reachable however far the list has scrolled. This is the default."
			/>

			<Example
				example="batch-action-bar/inline"
				title="Inline"
				description="Sits in flow instead. Use it inside a panel that scrolls its own body, where a fixed element would escape the container it belongs to."
			/>

			<Example
				id="api"
				title="API"
				description="The summary takes both counts because the sentence differs per language — that is why it is a function rather than a template the component assembles."
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					<Callout>
						Omit <code>onClear</code> to render no clear control. A selection the reader cannot drop
						needs a deliberate reason.
					</Callout>
					<PropTable owner="BatchActionBar" />
				</Stack>
			</Example>
		</ComponentPage>
	)
}
