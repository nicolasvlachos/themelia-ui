import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIProvider } from "themelia-ui/ui-provider"

import { ControlRow } from "./_shared"

export default function Nesting() {
	return (
		<UIProvider config={{ scale: 1.125 }}>
			<Stack>
				<Text type="secondary" size="sm">
					Outer scope — 1.125
				</Text>
				<ControlRow />
				<UIProvider config={{ scale: 0.8 }}>
					<Stack gap="sm">
						<Text type="secondary" size="sm">
							Nested scope — 0.8
						</Text>
						<ControlRow />
					</Stack>
				</UIProvider>
			</Stack>
		</UIProvider>
	)
}
