import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { ProductVariantDetails, ProductVariantEditor } from "themelia-ui/features/products"

import { OPTION_SUMMARY } from "./data"

export default function VariantDetail() {
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			{/* Stacked, not two-up: both of these switch layout on their OWN width, and a
			    half-column here is narrower than either ever gets in a real rail. */}
			<Stack>
				<ProductVariantDetails
					variant={{
						id: "m-trail",
						name: "M · Trail",
						description: "Medium frame, Trail build kit.",
						options: ["M", "Trail"],
						sku: "TRL-29-M-TR",
						price: "€1,850",
						inventory: "31",
						channels: "Online store, POS",
						updatedAt: "yesterday",
						status: "Live",
						statusTone: "success",
					}}
					optionItems={OPTION_SUMMARY}
					onBack={() => note("back to the list")}
					onEditVariant={(variant) => note(`edit ${variant.id}`)}
					onDeleteVariant={(variant) => note(`delete ${variant.id}`)}
					onSelectOption={(option) => note(`open option ${option.id}`)}
				/>

				<ProductVariantEditor
					defaultValue={{
						name: "M · Trail",
						sku: "TRL-29-M-TR",
						price: "€1,850",
						inventory: "31",
						status: "live",
						channels: "Online store, POS",
						options: { size: "m", build: "trail" },
					}}
					statusOptions={[
						{ value: "live", label: "Live" },
						{ value: "draft", label: "Draft" },
						{ value: "archived", label: "Archived" },
					]}
					optionFields={[
						{
							id: "size",
							label: "Frame size",
							choices: [
								{ value: "s", label: "S" },
								{ value: "m", label: "M" },
								{ value: "l", label: "L" },
							],
						},
						{
							id: "build",
							label: "Build kit",
							choices: [
								{ value: "trail", label: "Trail" },
								{ value: "expedition", label: "Expedition" },
							],
						},
					]}
					onSubmit={(values) => note(`saved ${values.name ?? "the variant"}`)}
					onCancel={() => note("cancelled")}
					onDelete={(values) => note(`delete ${values.sku ?? "the variant"}`)}
				/>
			</Stack>

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
