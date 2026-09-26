import { Stack } from "@/components/base/structure"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BatchActionBarPage() {
	return (
		<ComponentPage
			title="Batch action bar"
			summary="The bar that appears once a selection exists. A count, the bulk actions, and a way out — shared by every surface that can select more than one thing."
			importPath="@/components/base/batch-action-bar"
			exports={["BatchActionBar", "defaultBatchActionBarStrings"]}
		>
			<Example
				example="batch-action-bar/floating"
				title="Floating"
				description="Docks to the bottom centre of the viewport, so it stays reachable however far the list has scrolled. This is the default."
				stacked
			/>

			<Example
				example="batch-action-bar/inline"
				title="Inline"
				description="Sits in flow instead. Use it inside a panel that scrolls its own body, where a fixed element would escape the container it belongs to."
				stacked
			/>

			<Example
				id="api"
				title="API"
				description="The summary takes both counts because the sentence differs per language — that is why it is a function rather than a template the component assembles."
				stacked
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					<Callout>
						Omit <code>onClear</code> to render no clear control. A selection the reader cannot drop
						needs a deliberate reason.
					</Callout>
					<PropTable owner="BatchActionBar"
						rows={[
							{ name: "selectedCount", type: "number", description: "Renders nothing at zero, so the bar can be mounted unconditionally." },
							{ name: "totalCount", type: "number", description: "Optional denominator. Omit when the total is unknown or unbounded." },
							{ name: "onClear", type: "() => void", description: "Drops the selection. Omitted renders no clear control." },
							{ name: "placement", type: '"floating" | "inline"', description: "Docked to the viewport, or in flow. Defaults to floating." },
							{ name: "strings", type: "Partial<BatchActionBarStrings>", description: "summary(selected, total), clear, and the region's accessible label." },
							{ name: "children", type: "ReactNode", description: "The bulk actions — buttons, a menu, whatever the surface needs." },
						]}
					/>
				</Stack>
			</Example>
		</ComponentPage>
	)
}
