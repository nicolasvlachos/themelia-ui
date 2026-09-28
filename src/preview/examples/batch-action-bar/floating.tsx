import { useState } from "react"

import { BatchActionBar } from "themelia-ui/base/batch-action-bar"
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

/*
 * `transform` makes the demo box the containing block for the fixed bar. The same applies
 * in an app: inside a transformed or `contain: paint` ancestor, the bar docks to that box.
 */
const DEMO_BOX: React.CSSProperties = {
	position: "relative",
	transform: "translate(0)",
	minHeight: "12rem",
	width: "100%",
	padding: "var(--padding)",
	border: "var(--border-width) dashed var(--border)",
	borderRadius: "var(--radius)",
}

export default function Floating() {
	const [selected, setSelected] = useState(3)

	return (
		<Stack gap="sm" style={{ width: "100%" }}>
			<Stack direction="horizontal" gap="sm" align="center">
				<Button type="button" tone="neutral" appearance="outline" onClick={() => setSelected((n) => n + 1)}>
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
					<Button type="button" tone="neutral" appearance="ghost">
						Export
					</Button>
					<Button type="button" tone="destructive" appearance="ghost">
						Delete
					</Button>
				</BatchActionBar>
			</div>
		</Stack>
	)
}
