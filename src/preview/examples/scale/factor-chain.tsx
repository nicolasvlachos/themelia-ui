import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Scope } from "themelia-ui/ui-provider"

import { ControlRow } from "./_shared"

export default function FactorChain() {
	return (
		<Stack gap="lg">
			<Stack gap="sm">
				<Text type="secondary" size="xs">default</Text>
				<ControlRow />
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">--density-scale: 0.8 — heights and rows tighten, gaps hold</Text>
				<Scope vars={{ "--density-scale": 0.8 }}>
					<ControlRow />
				</Scope>
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">--density-scale: 1.4 — gaps open, control heights hold</Text>
				<Scope vars={{ "--density-scale": 1.4 }}>
					<ControlRow />
				</Scope>
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">--button-h: 2.75rem — one measurement</Text>
				<Scope vars={{ "--button-h": "2.75rem" }}>
					<ControlRow />
				</Scope>
			</Stack>
		</Stack>
	)
}
