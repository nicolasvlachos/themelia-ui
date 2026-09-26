import { useState } from "react"

import { PillRadioGroup } from "@/components/base/choice-inputs"
import { Grid, Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	ProductOptionsMatrix, ProductOptionsSummary, ProductVariantDetails, ProductVariantEditor,
	ProductVariantsBulkTable, ProductVariantsManager, ProductVariantsTable,
} from "@/components/features"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { OPTION_GROUPS, OPTION_SUMMARY, VARIANTS } from "./products-data"
import { useCatalogue } from "./use-catalogue"

export function ProductVariantsPage() {
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
		<ComponentPage
			title="Options & variants"
			summary="The options a customer chooses between, and the sellable combinations they generate. Two surfaces that belong together: adding a value changes the variant grid, and a reader who cannot see both while doing it is guessing at what they just made. Everything on this page is live — add an option, name it, give it values, then generate."
			importPath="@/components/features/products"
			exports={[
				"ProductVariantsManager", "ProductOptionsMatrix", "ProductOptionsSummary",
				"ProductVariantsBulkTable", "ProductVariantsTable", "ProductVariantEditor",
			]}
		>
			<Example
				id="manager"
				title="Options and variants together"
				description="The pair, wired to one catalogue. Add an option and it opens straight into its editor — an option with no name and no values is not a thing anyone wanted, it is the first half of adding one. Press Generate and the grid fills in the combinations, keeping the SKU, price and stock already typed against the ones that survive."
				stacked
				code={`<ProductVariantsManager
  optionGroups={options}
  variants={variants}
  groupByOptionId="size"
  cellDisplay="field"
  onCreateOption={createOption}
  onSaveEditingOption={(option, draft) => save(option.id, draft)}
  onAddValue={addValue}
  onGenerateVariants={generate}
  onVariantFieldBlur={(variant, field, value) => patch(variant.id, field, value)}
/>`}
			>
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
			</Example>

			<Example
				id="options"
				title="The two option surfaces"
				description="The summary is read-only — what a customer chooses between. The matrix edits: the name and the values are staged together and committed on Save, because renaming “Size” while adding “XL” is one thought, and a dialog per option would make it two while hiding the other options the new value has to combine with."
				stacked
				code={`<ProductOptionsSummary options={summary} onManageOptions={openMatrix} />

<ProductOptionsMatrix
  optionGroups={groups}
  onSaveEditingOption={(option, draft) => save(option.id, draft)}
  onAddValue={addValue}
  onDeleteOption={remove}
  confirmDelete            // on by default — removing an option removes its variants
/>`}
			>
				<Grid gap="lg">
					<ProductOptionsSummary
						options={OPTION_SUMMARY}
						onManageOptions={() => note("manage options")}
						onSelectOption={(option) => note(`open ${option.id}`)}
					/>
					<ProductOptionsMatrix {...optionHandlers} confirmDelete={false} />
				</Grid>
			</Example>

			<Example
				id="variants"
				title="Variants"
				description="Two tables, because they answer different questions. The summary says what exists and at what price. The bulk table is the editor — it selects, groups, and edits SKU, price and stock in place, because setting a price on forty variants one dialog at a time is the thing a variant editor exists to avoid."
				stacked
				code={`<ProductVariantsBulkTable
  variants={variants}
  optionGroups={groups}
  groupByOptionId="size"
  cellDisplay={{ sku: "field", price: "field", inventory: "text" }}
  onVariantFieldBlur={(variant, field, value) => api.patch(variant.id, { [field]: value })}
  onBulkDelete={(rows) => api.removeMany(rows.map((row) => row.id))}
/>`}
			>
				<Stack gap="lg">
					<ProductVariantsTable
						variants={catalogue.variants.slice(0, 3).map((variant) => ({
							...variant,
							options: [variant.optionValues?.size, variant.optionValues?.build],
						}))}
						onCreateVariant={() => note("create variant")}
						onEditVariant={(variant) => note(`edit ${variant.id}`)}
						onDeleteVariant={(variant) => note(`delete ${variant.id}`)}
					/>

					<Stack direction="horizontal" gap="md" align="center">
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
				</Stack>
			</Example>

			<Example
				id="variant-detail"
				title="One variant, read and edited"
				description="Details is bound to a selection, so `variant` is optional — nothing chosen yet is a state the panel should say rather than one it should disappear for. The editor holds every field as a string, because a form's value is what was typed: “24.0” and “24.00” are different things to a person mid-edit and the same number to parseFloat, and parsing here would rewrite the field under the cursor."
				stacked
				code={`<ProductVariantDetails
  variant={selected}
  optionItems={options}
  onBack={() => setSelected(null)}
  onEditVariant={(variant) => setEditing(variant)}
/>

<ProductVariantEditor
  defaultValue={{ name: "M · Trail", sku: "TRL-29-M-TR", price: "€1,850" }}
  optionFields={[{ id: "size", label: "Frame size", choices: sizes }]}
  statusOptions={statuses}
  onSubmit={(values) => api.save(values)}
  onDelete={(values) => api.remove(values)}
/>`}
			>
				{/* Stacked, not two-up: both of these switch layout on their OWN width, and a
				    half-column here is narrower than either ever gets in a real rail. */}
				<Stack gap="lg">
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
			</Example>

			<Example
				id="empty"
				title="Nothing yet"
				description="Every card takes an empty node, and every default says what is missing rather than “No data”. The bulk table's default carries the action that fixes it — a product with options and no variants is one press away from having them, and that press belongs where the reader notices the gap."
				stacked
				code={`<ProductVariantsBulkTable
  variants={[]}
  onGenerateVariants={() => api.generate(productId)}
/>`}
			>
				<Grid gap="lg">
					<ProductVariantsBulkTable
						variants={[]}
						onGenerateVariants={() => note("generate the combinations")}
					/>
					<ProductOptionsMatrix
						optionGroups={[]}
						onCreateOption={() => note("create the first option")}
					/>
				</Grid>
			</Example>

			<Example id="variants-rules" title="Two rules" stacked>
				<Callout label="Deleting an option deletes its variants">
					Which is not visible from the option's own row, and is not what “delete this one
					thing” usually means — so the matrix confirms by default. Turn{" "}
					<code>confirmDelete</code> off when the app already asks, so nobody is asked twice.
				</Callout>
				<Callout label="An empty state owns its own action">
					With nothing to show, the header's “Generate variants” and “Add an option” step
					aside: the default empty body already renders the same button under the same label,
					six inches below. A consumer who supplied their own empty body keeps the header
					control, since theirs may carry no trigger at all.
				</Callout>
				{log.length > 0 && (
					<Stack gap="none">
						{log.map((line, index) => (
							<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
						))}
					</Stack>
				)}
			</Example>

			<Example id="variants-api" title="API">
				<PropTable owner="ProductVariantsManager"
					rows={[
						{ name: "ProductOptionsMatrix confirmDelete", type: "boolean", default: "true", description: "Removing an option removes every variant generated from it — which is not visible from the option's own row. Off when the app already confirms, so nobody is asked twice." },
						{ name: "onSaveEditingOption", type: "(option, draft) => void", description: "The staged name and values, committed together. Cancel discards them; the draft is re-seeded from the option each time editing opens, so a cancelled edit cannot leak into the next one." },
						{ name: "cellDisplay", type: "\"text\" | \"field\" | Partial<Record<field, …>>", description: "Per field, so a table can make price editable and leave stock read-only — which is what a price update run actually needs." },
						{ name: "onVariantFieldChange / onVariantFieldBlur", type: "(variant, field, value, context) => void", description: "Both, and the consumer picks. Change alone makes every keystroke a state update; blur alone loses the value if the row is removed mid-edit." },
						{ name: "groupByOptionId", type: "string | null", description: "Groups rows under that option's values, in the order the option declares them — not alphabetically, and not by whichever variant was created first. null leaves the list flat." },
						{ name: "renderBulkActions", type: "(context) => ReactNode", description: "Replaces the default pair. The context carries the selected rows, the counts, and both clearSelection and setSelectedIds, so a custom bar can act and then deselect." },
						{ name: "ProductVariantDetails variant", type: "ProductVariantSummary", description: "Optional. Absent renders the empty state — this panel is usually bound to a selection, and “nothing chosen yet” is a thing to say, not a reason to unmount." },
						{ name: "ProductVariantEditor submitting", type: "boolean", description: "OR-ed with an internal flag. A consumer holding the request already knows it is in flight; one that just handed over an async onSubmit does not, and a form that stays live during a save takes the same submit twice." },
						{ name: "ProductVariantEditor optionFields", type: "ProductVariantOptionField[]", description: "A select when the field carries choices, a text input when it does not — an app with a free-text status should not have to invent a list to use this." },
						{ name: "ProductVariantsManager optionsStrings / variantsStrings", type: "Partial<…Strings>", description: "The two children keep their own copy objects. One merged bag would collide on title, description and the create labels, which both of them have." },
						{ name: "ProductVariantCell", type: "component", description: "A label/value pair that survives losing its table: the label is screen-reader-only while the column heading names the value, and becomes visible below the md breakpoint where the headings are gone." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
