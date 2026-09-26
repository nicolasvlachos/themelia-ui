import { AdaptiveGrid } from "themelia-ui/base/structure"

import { Box } from "./_shared"

export default function AdaptiveGridExample() {
	return (
		<AdaptiveGrid minColumnWidth="sm" gap="md">
			{Array.from({ length: 6 }, (_, i) => (
				<Box key={i}>card {i + 1}</Box>
			))}
		</AdaptiveGrid>
	)
}
