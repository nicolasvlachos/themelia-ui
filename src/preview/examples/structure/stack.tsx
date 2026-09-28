import { Stack } from "themelia-ui/base/structure"

import { Box } from "./_shared"

export default function StackExample() {
	return (
		<>
			<Stack gap="sm">
				<Box>vertical, gap sm</Box>
				<Box>second</Box>
			</Stack>
			<Stack direction="horizontal" gap="sm" justify="between" align="center">
				<Box>horizontal</Box>
				<Box>justify between</Box>
				<Box>align center</Box>
			</Stack>
		</>
	)
}
