import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIProvider } from "themelia-ui/ui-provider"

import { ControlRow } from "./_shared"

const FACTORS = [0.75, 0.875, 1, 1.125, 1.25] as const

export default function TheFactor() {
	return (
		<>
			{FACTORS.map((scale) => (
				<UIProvider key={scale} config={{ scale }}>
					<Stack direction="horizontal" align="center">
						<Text tag="span" size="xs" mono style={{ width: "4rem", flex: "none" }}>{scale}</Text>
						<ControlRow />
					</Stack>
				</UIProvider>
			))}
		</>
	)
}
