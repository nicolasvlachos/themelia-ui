import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIProvider } from "themelia-ui/ui-provider"

import { ControlRow } from "./_shared"

export default function Density() {
	return (
		<>
			{(["compact", "default", "comfortable"] as const).map((density) => (
				<UIProvider key={density} config={{ density }}>
					<Stack direction="horizontal" align="center">
						<Text tag="span" size="xs" mono style={{ width: "7rem", flex: "none" }}>{density}</Text>
						<ControlRow />
					</Stack>
				</UIProvider>
			))}
		</>
	)
}
