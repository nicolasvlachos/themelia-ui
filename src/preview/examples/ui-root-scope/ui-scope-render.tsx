import { Text } from "themelia-ui/base/typography"
import { UIScope } from "themelia-ui/ui-provider"

export default function UiScopeRender() {
	return (
		<UIScope
			render={<aside />}
			transparent={false}
			config={{ density: "compact" }}
			style={{ padding: "var(--space-lg)", border: "var(--border-width) solid var(--border)", borderRadius: "var(--radius)" }}
		>
			<Text size="xs" type="secondary">
				This scope is a real &lt;aside&gt;, at compact density.
			</Text>
		</UIScope>
	)
}
