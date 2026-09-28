import { Text } from "themelia-ui/base/typography"
import { PageActions } from "themelia-ui/layout/page"

import { RECORD_ACTIONS } from "./data"

export default function PageActionsExample() {
	return (
		<div style={{ width: "100%", display: "grid", gap: "var(--gap)" }}>
			{[4, 2, 1].map((max) => (
				<div key={max} style={{ display: "grid", gap: "var(--gap-sm)" }}>
					<Text size="xs" type="secondary">maxInlineActions={max}</Text>
					<PageActions actions={RECORD_ACTIONS} display="inline" maxInlineActions={max} />
				</div>
			))}
			<div style={{ display: "grid", gap: "var(--gap-sm)" }}>
				<Text size="xs" type="secondary">display="menu"</Text>
				<PageActions actions={RECORD_ACTIONS} display="menu" />
			</div>
		</div>
	)
}
