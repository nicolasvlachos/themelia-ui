import { Stack } from "themelia-ui/base/structure"

import { Box } from "./_shared"

export default function ResponsiveProps() {
	return (
		<Stack direction={{ base: "vertical", md: "horizontal" }} gap={{ base: "sm", md: "default" }}>
			<Box>stacks on small</Box>
			<Box>row from md</Box>
			<Box>gap grows too</Box>
		</Stack>
	)
}
