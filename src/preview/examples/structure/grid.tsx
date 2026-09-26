import { Grid, GridCell } from "themelia-ui/base/structure"

import { Box } from "./_shared"

export default function GridExample() {
	return (
		<Grid columns={{ base: 1, md: 3 }} gap="md">
			<GridCell span="full"><Box>span full</Box></GridCell>
			<GridCell><Box>one</Box></GridCell>
			<GridCell><Box>two</Box></GridCell>
			<GridCell><Box>three</Box></GridCell>
			<GridCell span={{ base: 1, md: 2 }}><Box>span 2 from md</Box></GridCell>
			<GridCell><Box>four</Box></GridCell>
		</Grid>
	)
}
