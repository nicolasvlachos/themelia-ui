import { useState } from "react"

import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { ProductOverview, ProductQuotePreviewCard } from "themelia-ui/features/products"

import { CONTRACT_METRICS, QUOTE } from "./data"

export default function Overview() {
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			<Grid>
				<ProductOverview
					title="Trailhead 29er"
					description="Aluminium trail hardtail, sold as a frameset or a complete build."
					status="Live"
					statusTone="success"
					metrics={CONTRACT_METRICS}
				/>
				<ProductQuotePreviewCard
					lines={QUOTE}
					note="Carrier is an estimate until an oversize profile is chosen."
					onRecalculate={() => note("recalculated the quote")}
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
