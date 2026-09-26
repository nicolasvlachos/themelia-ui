import { Stack } from "themelia-ui/base/structure"
import { UIProvider } from "themelia-ui/ui-provider"

import { ControlRow } from "./_shared"

export default function Density() {
	return (
		<>
			{(["compact", "default", "comfortable"] as const).map((density) => (
				<UIProvider key={density} config={{ density }}>
					<Stack direction="horizontal" gap="lg" align="center">
						<code style={{ width: "7rem", fontSize: "var(--text-xs)" }}>{density}</code>
						<ControlRow />
					</Stack>
				</UIProvider>
			))}
		</>
	)
}
