import { useState } from "react"

import { BatchActionBar } from "@/components/base/batch-action-bar"
import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

/*
 * `transform` makes the demo box the containing block for the fixed bar. The same applies
 * in an app: inside a transformed or `contain: paint` ancestor, the bar docks to that box.
 */
const DEMO_BOX: React.CSSProperties = {
	position: "relative",
	transform: "translate(0)",
	minHeight: "12rem",
	width: "100%",
	padding: "var(--space-lg)",
	border: "var(--border-width) dashed var(--border)",
	borderRadius: "var(--radius)",
}

export function BatchActionBarPage() {
	const [selected, setSelected] = useState(3)

	return (
		<ComponentPage
			title="Batch action bar"
			summary="The bar that appears once a selection exists. A count, the bulk actions, and a way out — shared by every surface that can select more than one thing."
			importPath="@/components/base/batch-action-bar"
			exports={["BatchActionBar", "defaultBatchActionBarStrings"]}
		>
			<Example
				id="floating"
				title="Floating"
				description="Docks to the bottom centre of the viewport, so it stays reachable however far the list has scrolled. This is the default."
				stacked
				code={`<BatchActionBar selectedCount={selected} totalCount={250} onClear={() => setSelected(0)}>
	<Button tone="neutral" buttonStyle="ghost">Export</Button>
	<Button tone="destructive" buttonStyle="ghost">Delete</Button>
</BatchActionBar>`}
			>
				<Stack gap="md" style={{ width: "100%" }}>
					<Stack direction="horizontal" gap="sm" align="center">
						<Button type="button" tone="neutral" buttonStyle="outline" onClick={() => setSelected((n) => n + 1)}>
							Select one more
						</Button>
						<Text size="sm" type="secondary">
							The bar unmounts at zero, so it can be rendered unconditionally.
						</Text>
					</Stack>
					<div style={DEMO_BOX}>
						<Text size="sm" type="secondary">
							The bar below is contained to this box for the demo. In an app it docks to the viewport.
						</Text>
						<BatchActionBar selectedCount={selected} totalCount={250} onClear={() => setSelected(0)}>
							<Button type="button" tone="neutral" buttonStyle="ghost">
								Export
							</Button>
							<Button type="button" tone="destructive" buttonStyle="ghost">
								Delete
							</Button>
						</BatchActionBar>
					</div>
				</Stack>
			</Example>

			<Example
				id="inline"
				title="Inline"
				description="Sits in flow instead. Use it inside a panel that scrolls its own body, where a fixed element would escape the container it belongs to."
				stacked
				code={`<BatchActionBar placement="inline" selectedCount={12} onClear={clear}>
	<Button tone="neutral" buttonStyle="ghost">Assign</Button>
</BatchActionBar>`}
			>
				<BatchActionBar
					placement="inline"
					selectedCount={12}
					onClear={() => undefined}
					strings={{ label: "Inline batch actions example" }}
				>
					<Button type="button" tone="neutral" buttonStyle="ghost">
						Assign
					</Button>
				</BatchActionBar>
			</Example>

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
