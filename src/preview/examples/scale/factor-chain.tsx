import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Scope, UIProvider } from "themelia-ui/ui-provider"

import { ControlRow } from "./_shared"

export default function FactorChain() {
	return (
		<Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">default</Text>
				<ControlRow />
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">scale: 0.875 — every length and type step</Text>
				<UIProvider config={{ scale: 0.875 }}>
					<ControlRow />
				</UIProvider>
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">--control-height: 2.5rem — every control, nothing else</Text>
				<Scope vars={{ "--control-height": "2.5rem" }}>
					<ControlRow />
				</Scope>
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">--radius-sm: 0 — every item corner</Text>
				<Scope vars={{ "--radius-sm": "0" }}>
					<ControlRow />
				</Scope>
			</Stack>
		</Stack>
	)
}
