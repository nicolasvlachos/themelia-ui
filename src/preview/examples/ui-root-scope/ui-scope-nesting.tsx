import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIScope } from "themelia-ui/ui-provider"

import { Sample } from "./_shared"

export default function UiScopeNesting() {
	return (
		<UIScope config={{ colorScheme: "dark" }} transparent={false} style={{ padding: "var(--space-xl)", borderRadius: "var(--radius)", background: "var(--background)" }}>
			<Stack gap="lg">
				<Text size="xs" type="secondary">
					outer: colorScheme=&quot;dark&quot;
				</Text>
				<UIScope config={{ density: "compact" }}>
					<Sample label="inner: density=&quot;compact&quot;, theme inherited" />
				</UIScope>
			</Stack>
		</UIScope>
	)
}
