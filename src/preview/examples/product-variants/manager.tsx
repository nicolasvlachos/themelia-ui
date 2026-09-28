import { useState } from "react"

import { PillRadioGroup } from "themelia-ui/base/choice-inputs"
import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	ProductOptionsMatrix, ProductOptionsSummary, ProductVariantsBulkTable, ProductVariantsManager,
	ProductVariantsTable,
} from "themelia-ui/features/products"

import { OPTION_GROUPS, OPTION_SUMMARY, VARIANTS } from "./data"
import { useCatalogue } from "./use-catalogue"

export default function Manager() {
	const [log, setLog] = useState<string[]>([])
	const [groupBy, setGroupBy] = useState<string | null>("size")
	const catalogue = useCatalogue(OPTION_GROUPS, VARIANTS)

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	/* Every option and variant callback, wired to the same store — so the manager, the
	 * matrix and the bulk table below it are all editing one catalogue. */
	const optionHandlers = {
		optionGroups: catalogue.options,
		editingOptionId: catalogue.editingOptionId,
		onEditingOptionIdChange: catalogue.setEditingOptionId,
		onCreateOption: catalogue.createOption,
		onDeleteOption: catalogue.deleteOption,
		onAddValue: catalogue.addValue,
		onDeleteValue: catalogue.deleteValue,
		onSaveEditingOption: catalogue.saveOption,
		onCancelEditingOption: () => catalogue.setEditingOptionId(null),
		onReorderOptions: catalogue.reorderOptions,
	}

	const variantHandlers = {
		variants: catalogue.variants,
		onGenerateVariants: catalogue.generateVariants,
		onVariantFieldBlur: (variant: { id: string }, field: "sku" | "price" | "inventory", value: string) =>
			catalogue.setVariantField(variant.id, field, value),
		onBulkDelete: (rows: readonly { id: string }[]) =>
			catalogue.deleteVariants(rows.map((row) => row.id)),
		onSetVariantImage: (variant: { id: string }) => note(`choose a picture for ${variant.id}`),
	}

	return (
		<>
			<ProductVariantsManager
				{...optionHandlers}
				{...variantHandlers}
				defaultGroupByOptionId={catalogue.options[0]?.id ?? null}
				visibleColumns={["variant", "sku", "price", "inventory"]}
				cellDisplay="field"
				confirmDelete={false}
				onEditVariant={(variant) => note(`edit ${variant.id}`)}
			/>
			<Text size="xs" type="secondary">
				{catalogue.options.length} options describe {catalogue.variantCount} combinations ·{" "}
				{catalogue.variants.length} rows exist
			</Text>

			<Grid>
				<ProductOptionsSummary
					options={OPTION_SUMMARY}
					onManageOptions={() => note("manage options")}
					onSelectOption={(option) => note(`open ${option.id}`)}
				/>
				<ProductOptionsMatrix {...optionHandlers} confirmDelete={false} />
			</Grid>

			<ProductVariantsTable
				variants={catalogue.variants.slice(0, 3).map((variant) => ({
					...variant,
					options: [variant.optionValues?.size, variant.optionValues?.build],
				}))}
				onCreateVariant={() => note("create variant")}
				onEditVariant={(variant) => note(`edit ${variant.id}`)}
				onDeleteVariant={(variant) => note(`delete ${variant.id}`)}
			/>

			<Stack direction="horizontal" gap="sm" align="center">
				<Text size="sm" type="secondary">Group by</Text>
				<PillRadioGroup
					value={groupBy}
					onValueChange={setGroupBy}
					allowClear
					options={[
						{ value: "size", label: "Frame size" },
						{ value: "build", label: "Build kit" },
					]}
				/>
			</Stack>

			<ProductVariantsBulkTable
				{...variantHandlers}
				optionGroups={catalogue.options}
				groupByOptionId={groupBy}
				cellDisplay={{ sku: "field", price: "field" }}
				onEditVariant={(variant) => note(`edit ${variant.id}`)}
				onBulkEdit={(rows) => note(`bulk edit ${rows.length}`)}
			/>

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
