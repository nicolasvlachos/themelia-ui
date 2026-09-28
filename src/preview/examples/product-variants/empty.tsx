import { useState } from "react"

import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { ProductOptionsMatrix, ProductVariantsBulkTable } from "themelia-ui/features/products"

export default function Empty() {
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			<Grid>
				<ProductVariantsBulkTable
					variants={[]}
					onGenerateVariants={() => note("generate the combinations")}
				/>
				<ProductOptionsMatrix
					optionGroups={[]}
					onCreateOption={() => note("create the first option")}
				/>
			</Grid>

			{log.length > 0 && (
				<Stack gap="none">
					{log.map((line, index) => (
						<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
					))}
				</Stack>
			)}
		</>
	)
}
