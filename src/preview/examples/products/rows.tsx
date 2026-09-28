import { useState } from "react"
import { BoxIcon, LayersIcon, WarehouseIcon } from "lucide-react"

import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	ProductOperationsCard, ProductReadinessCard, ProductStructureCard,
} from "themelia-ui/features/products"

import { OPERATIONS, READINESS } from "./data"

const STRUCTURE = [
	{ id: "variants", label: "Variants", value: "18", description: "3 sizes × 3 colours × 2 builds", icon: <LayersIcon /> },
	{ id: "skus", label: "Live SKUs", value: "14", description: "4 held back for launch", tone: "primary" as const, icon: <BoxIcon /> },
	{ id: "stock", label: "On hand", value: "212", description: "Across two warehouses", icon: <WarehouseIcon /> },
]

export default function Rows() {
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			<Grid>
				<ProductReadinessCard
					score={72}
					items={READINESS}
					summary="Two checks left before this can be published."
					onSelectReadinessItem={(item) => note(`readiness: ${item.id}`)}
				/>
				<Stack>
					<ProductStructureCard
						metrics={STRUCTURE}
						onSelectMetric={(metric) => note(`structure: ${metric.id}`)}
					/>
					<ProductOperationsCard
						items={OPERATIONS}
						onSelectOperation={(item) => note(`operations: ${item.id}`)}
					/>
				</Stack>
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
