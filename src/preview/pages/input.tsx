import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function InputPage() {
	return (
		<ComponentPage>
			<Example
				example="input/shared-surface"
				title="One shared surface"
				description="Input, Textarea, Select, Combobox, and anything added later opt in with `data-field-control`. The surface is defined once, globally — five copies in five modules drift the moment one is edited."
			/>

			<Example
				example="input/iphone-input-zoom"
				title="Optional iPhone zoom prevention"
				description="Fields keep the same typography at every width. Enable forms.preventIPhoneZoom to give native inputs a 16px minimum on iPhones only. The default is off; nested Providers can opt out. Button-based controls keep their normal text size."
			/>

			<Example
				example="input/states"
				title="States"
				description="Invalid is expressed with aria-invalid, so the red border and the announcement can never disagree — a coloured border with nothing said to a screen reader is the usual way that happens."
			/>

			<Example
				example="input/affordances"
				title="Inline affordances"
				description="FieldShell wears the surface and the control inside gives up its own, so an icon or a trailing action reads as part of one field rather than a box inside a box. Focus keys off the control's own state — a trailing button must not light up the field."
			/>

			<Example id="input-api" title="API">
				<PropTable owner="Input"
					rows={[
						{ name: "startIcon / endIcon", type: "ReactNode", description: "Glyphs inside the field, in their own lane so the text never runs under them." },
						{ name: "startAddon / endAddon", type: "ReactNode", description: "Attached chrome outside the text — a prefix, a unit, a currency." },
						{ name: "clearable / onClear", type: "boolean / () => void", description: "A clear affordance once there is a value. Goes through the native value setter so React's tracker stays in sync." },
						{ name: "loading", type: "boolean", description: "A spinner in the trailing lane. Outranks every other trailing affordance." },
						{ name: "showCharacterCount / maxLength", type: "boolean / number", description: "A count in the trailing lane, and the limit it counts against." },
						{ name: "invalid", type: "boolean", description: "The error surface. Pair with FormField's error for the message — the border and the announcement then cannot disagree." },
						{ name: "FieldShell", type: "component", description: "The surface on its own, for composing a control the kit does not ship." },
						{ name: "strings", type: "Partial<InputStrings>", description: "Overrides this field's own copy — the clear label, the character-count format." },
						{ name: "returnValueWithAddons", type: "boolean", default: "false", description: "Includes the addons in the reported value. Off, because an addon is presentation and a caller that stores \"$\" + the number has to strip it again on the way out." },
						{ name: "useFieldValue", type: "hook", description: "The controlled/uncontrolled value, the generated id, and the character count with its limit, shared by Input and Textarea (SearchInput wraps Input), so both fields behave the same under a form library." },
					]}
				/>
			</Example>

			<Example id="search-api" title="SearchInput API">
				<PropTable owner="SearchInput"
					rows={[
						{ name: "onClear", type: "() => void", description: "Notified when the field is cleared. The clear control is always present once there is a value — Input does the clearing itself." },
						{ name: "strings", type: "Partial<InputStrings>", default: '{ clear: "Clear search" }', description: "Overrides this field's own copy. It is Input's strings object with one default narrowed — a search field's only copy is one word of Input's." },
						{ name: "…InputProps", api: "@/components/base/text-inputs#InputProps", type: "InputProps", description: "Everything else is Input's API — SearchInput only pre-wires the magnifier and the clear." },
						{ name: "placeholder", type: "string", description: "Say what is being searched, not just 'Search'." },
					]}
				/>
			</Example>

			<Example id="password-api" title="PasswordInput API">
				<PropTable owner="PasswordInput"
					rows={[
						{ name: "value / defaultValue", type: "string", description: "Same as Input." },
						{ name: "invalid", type: "boolean", description: "The error surface." },
						{ name: "strings", type: "Partial<PasswordInputStrings>", description: "Overrides this field's own copy — the reveal control's name in each state, which IS its state for a screen reader, and Input's own strings." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
