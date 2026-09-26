import { Split, Stack } from "themelia-ui/base/structure"

import { Box } from "./_shared"

export default function SplitExample() {
	return (
		<Stack gap="lg" style={{ width: "100%" }}>
			<Split sideWidth="14rem" gap="md">
				<Box>main content, takes the rest</Box>
				<Box>side, 14rem</Box>
			</Split>
			<Split side="start" sideWidth="14rem" gap="md">
				<Box>main content — still first in the DOM</Box>
				<Box>side, drawn on the left</Box>
			</Split>
		</Stack>
	)
}
