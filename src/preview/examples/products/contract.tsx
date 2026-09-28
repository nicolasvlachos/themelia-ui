import { useState } from "react"

import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	ProductContractOverview, ProductDetailsCard, ProductPoliciesCard,
} from "themelia-ui/features/products"

import { CONTRACT_METRICS, CONTRACT_TERMS, DETAILS, POLICIES, RULES } from "./data"

export default function Contract() {
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			<Grid>
				<Stack>
					<ProductDetailsCard
						metadata={DETAILS}
						onEditDetails={() => note("edit details")}
					/>
					<ProductPoliciesCard
						policies={POLICIES}
						onSelectPolicy={(policy) => note(`policy: ${policy.id}`)}
					/>
				</Stack>
				<ProductContractOverview
					metrics={CONTRACT_METRICS}
					terms={CONTRACT_TERMS}
					rules={RULES}
					onOpenContract={() => note("open contract")}
					onCreateRule={() => note("create rule")}
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
