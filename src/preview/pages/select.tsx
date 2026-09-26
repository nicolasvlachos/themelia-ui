import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SelectPage() {
	return (
		<ComponentPage
			title="Select"
			summary="A single choice from a list too long to show at once. Its rows use the shared menu row, so it matches every other menu surface in the kit."
			importPath="@/components/base/choice-inputs"
			exports={["Select", "type SelectOption", "SelectRoot", "SelectTriggerPrimitive", "SelectValuePrimitive", "SelectIconPrimitive", "SelectPopupContent", "SelectPopupGroup", "SelectPopupItem", "SelectPopupLabel", "SelectPopupSeparator"
			]}
		>
			<Example
				example="select/select"
				title="Select"
				description="The canonical finite-option control, on Base UI. An option carries an icon and a second line, both of which show once the list is open. The trigger wears the shared field surface — the same height, border, focus ring and chevron as Input, Combobox and NativeSelect, so a form built from all four reads as one set of controls."
				stacked
			/>

			<Example id="select-api" title="API">
				<PropTable owner="Select"
					rows={[
						{ name: "options", type: "SelectOption[]", description: "The choices. Each carries a value, a label, and optional description and icon." },
						{ name: "value / onValueChange", type: "string | null / (value) => void", description: "Controlled selection." },
						{ name: "placeholder", type: "string", description: "Shown while nothing is selected." },
						{ name: "allowClear", type: "boolean", default: "false", description: "Prepends an option that clears the selection, for a field whose empty state is a real answer." },
						{ name: "invalid / required / readOnly", type: "boolean", description: "Field state. invalid pairs with a message on the FormField; the trigger only carries the treatment." },
						{ name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "The popup's own state, for a select driven from outside — a tour, a keyboard shortcut." },
						{ name: "side / align / alignItemWithTrigger", type: '"top" | "bottom" / "start" | "end" / boolean', description: "Where the popup sits. Aligning the CHOSEN item with the trigger is the native behaviour; off, the list opens under the field." },
						{ name: "highlightItemOnHover", type: "boolean", description: "Moves the highlight with the pointer. Off, the highlight belongs to the keyboard alone." },
						{ name: "renderOption / renderValue", type: "(option) => ReactNode", description: "Replaces a row, or what the trigger shows. The value renderer is what a select of avatars needs." },
						{ name: "form / autoComplete / inputRef", type: "string / string / Ref", description: "For the hidden native input that carries the value into a form submit." },
						{ name: "NativeSelect", type: "component", description: "The platform <select>, for a short list or a form that must post without JS. Same field surface." },
						{ name: "modal", type: "boolean", description: "Whether the open popup makes the page inert. Off for a select inside a surface that is already modal." },
						{ name: "onFocus / onBlur", type: "(event) => void", description: "On the trigger, so a form library can track touched state." },
						{ name: "contentClassName", type: "string", description: "Styles the popup surface. The trigger's own className stays on the trigger." },
						{ name: "SelectRoot / SelectTriggerPrimitive / SelectValuePrimitive / SelectIconPrimitive", type: "component", description: "The unassembled parts behind Select. Reach for them when the trigger has to be something Select cannot express \u2014 an avatar and a name, a swatch, two lines \u2014 and keep the popup and the keyboard behaviour rather than rebuilding them." },
						{ name: "SelectPopupContent / SelectPopupGroup / SelectPopupLabel / SelectPopupItem / SelectPopupSeparator", type: "component", description: "The popup and its divisions. A label is not an item: it is not focusable and the arrow keys skip it, which a styled item would get wrong." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
