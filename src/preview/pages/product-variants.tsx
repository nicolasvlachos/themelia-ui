import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ProductVariantsPage() {
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
				example="product-variants/manager"
				title="Options and variants together"
				description="One catalogue behind every surface: the manager pairs the option matrix with the variant grid, and the summary, matrix and tables below it edit the same store. Add an option and it opens straight into its editor — an option with no name and no values is not a thing anyone wanted, it is the first half of adding one. The matrix stages the name and the values together and commits them on Save, because renaming “Size” while adding “XL” is one thought, and a dialog per option would make it two while hiding the other options the new value has to combine with; the summary beside it is read-only, what a customer chooses between. Press Generate and the grid fills in the combinations, keeping the SKU, price and stock already typed against the ones that survive. The two tables answer different questions: the summary says what exists and at what price, and the bulk table selects, groups, and edits SKU, price and stock in place, because setting a price on forty variants one dialog at a time is the thing a variant editor exists to avoid."
			/>

			<Example
				example="product-variants/variant-detail"
				title="One variant, read and edited"
				description="Details is bound to a selection, so `variant` is optional — nothing chosen yet is a state the panel should say rather than one it should disappear for. The editor holds every field as a string, because a form's value is what was typed: “24.0” and “24.00” are different things to a person mid-edit and the same number to parseFloat, and parsing here would rewrite the field under the cursor."
			/>

			<Example
				example="product-variants/empty"
				title="Nothing yet"
				description="Every card takes an empty node, and every default says what is missing rather than “No data”. The bulk table's default carries the action that fixes it — a product with options and no variants is one press away from having them, and that press belongs where the reader notices the gap."
			/>

			<Example id="variants-rules" title="Two rules">
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
