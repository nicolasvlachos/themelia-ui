import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function RepeaterPage() {
	return (
		<ComponentPage
			title="Repeater"
			summary="A list the reader edits row by row — add, remove, reorder. The generic Repeater renders any row you give it; the three specialised ones cover the shapes that come up constantly."
			importPath="@/components/base/repeaters"
			exports={["Repeater", "StringRepeater", "KeyValueEditor", "LocalizedStringField", "ObjectRepeater", "LocalizedStringRepeater", "LocalizedObjectField"
			]}
		>
			<Example
				example="repeater/repeater"
				title="Repeater"
				description="The base component. It does not own the array — you pass items and the handlers, which is what keeps it usable with a form library or with plain state. Supplying onMove is what enables reordering and renders the handle."
				stacked
			/>

			<Example
				example="repeater/string-repeater"
				title="StringRepeater"
				description="A repeater of plain strings, which is most of them — domains, tags, recipients. Reordering is the native drag API plus arrow keys on the handle. A pointer library brings its own dependency and, on its own, no keyboard story — and reordering is exactly what a keyboard user cannot improvise."
				stacked
			/>

			<Example
				example="repeater/key-value"
				title="KeyValueEditor"
				description="Pairs rather than an object, because an object cannot hold a half-typed key: clearing one to retype it would lose the row and its value with it. Duplicate keys are flagged as you type."
				stacked
			/>

			<Example
				example="repeater/localized"
				title="LocalizedStringField"
				description="One value per locale, behind a locale switcher, so a translated field costs one row instead of one row per language. The value is an object keyed by locale code."
				stacked
			/>

			<Example id="repeater-rule" title="It never owns the array" stacked>
				<Callout label="Rule">
					Every repeater is controlled. It takes the items and the handlers and renders
					them; it keeps no copy. A component that owned the list would have to
					reconcile with whatever the form library also thinks the list is, and the two
					drift the first time a reset or a server round-trip happens.
				</Callout>
			</Example>

			<Example id="repeater-api" title="API">
				<PropTable owner="Repeater"
					rows={[
						{ name: "items", type: "T[]", description: "The rows. Required — the repeater renders what it is given and nothing else." },
						{ name: "getKey", type: "(item: T, index: number) => string", description: "Stable identity per row. Index alone would re-key every row after a reorder and lose focus." },
						{ name: "children", type: "(item: T, context) => ReactNode", description: "Render prop for one row. context carries index and dragging." },
						{ name: "onAdd", type: "() => void", description: "Supplying it renders the add button." },
						{ name: "onRemove", type: "(index: number) => void", description: "Supplying it renders the per-row remove button." },
						{ name: "onMove", type: "(from: number, to: number) => void", description: "Supplying it enables reordering and renders the drag handle. The handle is the drag source, not the row." },
						{ name: "rowVariant", type: '"inline" | "card"', default: '"inline"', description: "card wraps each row in a bordered surface, for multi-field rows." },
						{ name: "maxItems", type: "number", description: "Hides the add button once reached." },
						{ name: "strings", type: "Partial<RepeaterStrings>", description: "Overrides this list's own copy. `remove` is a FUNCTION of the row index — every remove button in a list saying the same thing is a column of controls a screen reader cannot tell apart." },
						{ name: "emptyState", type: "ReactNode", description: "Shown in place of the rows when items is empty." },
						{ name: "StringRepeater sortable", type: "boolean", default: "false", description: "Adds the drag handle and arrow-key reordering." },
						{ name: "KeyValueEditor flagDuplicateKeys", type: "boolean", default: "true", description: "Marks a key already used elsewhere. A blank key is not a duplicate — it is an unfinished row." },
						{ name: "LocalizedStringField locales", type: "LocaleDescriptor[]", description: "Which locales the switcher offers, in order. The first is the default." },
						{ name: "showAdd", type: "boolean", description: "Hides the add control while keeping the rows, for a list at its cap or one whose entries come from elsewhere." },
						{ name: "ObjectRepeater value / fields", type: "ObjectRow[] / ObjectFieldDef[]", description: "A repeating row of several fields, described once as data rather than assembled per row. The component reads and writes the array it is given; renderField lets the caller connect individual fields to a form library." },
						{ name: "LocalizedStringRepeater / LocalizedObjectField", type: "component", description: "The same shapes with a locale axis: one value per language, with the active locale switchable in place. A translation UI built out of plain repeaters loses which language a row belongs to the moment rows reorder." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
