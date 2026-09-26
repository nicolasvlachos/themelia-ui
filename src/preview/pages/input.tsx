import { useState } from "react"

import { UIProvider } from "@/lib/ui-provider"
import { Select } from "@/components/base/choice-inputs"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import {
	FieldShell, Input, NativeSelect, PasswordInput, SearchInput, Textarea,
} from "@/components/base/text-inputs"
import { Text } from "@/components/base/typography"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function InputPage() {
	const [search, setSearch] = useState("shipping")

	return (
		<ComponentPage
			title="Input"
			summary="The text field, and the shared surface every control in the kit wears — same height, border, focus ring, invalid state, and disabled treatment. SearchInput and PasswordInput are this field with an affordance pre-wired, so they live here too."
			importPath="@/components/base/text-inputs"
			exports={["Input", "SearchInput", "PasswordInput", "FieldShell", "NativeSelect", "useFieldValue"
			]}
		>
			<Example
				id="shared-surface"
				title="One shared surface"
				description="Input, Textarea, Select, Combobox, and anything added later opt in with `data-field-control`. The surface is defined once, globally — five copies in five modules drift the moment one is edited."
				stacked
				code={`/* styles/fields.css */
[data-field-control] {
  height: var(--control-h);
  border: 1px solid var(--input);
  box-shadow: var(--shadow-xs);
}
[data-field-control]:focus-visible { box-shadow: var(--focus-ring); }
[data-field-control][aria-invalid="true"] { box-shadow: var(--invalid-ring); }`}
			>
				<Stack gap="lg" style={MEASURE.field}>
					<FormField label="Input">
						<Input placeholder="Northwind Traders" />
					</FormField>
					<FormField label="Native select">
						<NativeSelect defaultValue="">
							<option value="" disabled>
								Select an option
							</option>
							<option value="a">First option</option>
							<option value="b">Second option</option>
						</NativeSelect>
					</FormField>
					<FormField label="Textarea">
						<Textarea placeholder="Anything worth recording." />
					</FormField>
				</Stack>
			</Example>

			<Example id="iphone-input-zoom" title="Optional iPhone zoom prevention"
				description="Fields keep the same typography at every width. Enable forms.preventIPhoneZoom to give native inputs a 16px minimum on iPhones only. The default is off; nested Providers can opt out. Button-based controls keep their normal text size."
				stacked code={`<UIProvider config={{ forms: { preventIPhoneZoom: true } }}>
  <Input aria-label="Enabled on iPhones" />
</UIProvider>`}>
				<UIProvider config={{ forms: { preventIPhoneZoom: true } }}>
					<Stack style={MEASURE.field}>
						<FormField label="Enabled on iPhones"><Input placeholder="16px minimum on iPhone" /></FormField>
						<FormField label="iPhone textarea"><Textarea /></FormField>
						<FormField label="iPhone native select"><NativeSelect><option>First option</option></NativeSelect></FormField>
						<FormField label="Button select"><Select options={[{ value: "a", label: "First option" }]} defaultValue="a" /></FormField>
						<UIProvider config={{ forms: { preventIPhoneZoom: false } }}>
							<FormField label="Nested opt-out"><Input placeholder="Normal field typography" /></FormField>
						</UIProvider>
					</Stack>
				</UIProvider>
			</Example>

			<Example
				id="states"
				title="States"
				description="Invalid is expressed with aria-invalid, so the red border and the announcement can never disagree — a coloured border with nothing said to a screen reader is the usual way that happens."
				stacked
				code={`<Input aria-invalid="true" />
<Input disabled />`}
			>
				<Stack gap="lg" style={MEASURE.field}>
					<FormField label="Default" helperText="The supporting line.">
						<Input placeholder="name@example.com" />
					</FormField>
					<FormField label="Invalid" error="Enter a valid email address.">
						<Input defaultValue="not-an-email" aria-invalid="true" />
					</FormField>
					<FormField label="Disabled">
						<Input placeholder="Not editable" disabled />
					</FormField>
					<FormField label="Disabled select">
						<NativeSelect disabled defaultValue="a">
							<option value="a">Not editable</option>
						</NativeSelect>
					</FormField>
				</Stack>
			</Example>

			<Example
				id="affordances"
				title="Inline affordances"
				description="FieldShell wears the surface and the control inside gives up its own, so an icon or a trailing action reads as part of one field rather than a box inside a box. Focus keys off the control's own state — a trailing button must not light up the field."
				stacked
				code={`<FieldShell start={<SearchIcon />} end={<Button>Go</Button>}>
  <Input />
</FieldShell>

<PasswordInput />
<SearchInput value={q} onChange={…} onClear={…} />`}
			>
				<Stack gap="lg" style={MEASURE.field}>
					<FormField label="Search" helperText="Clear appears once there is a value.">
						<SearchInput
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							onClear={() => setSearch("")}
							placeholder="Search orders"
						/>
					</FormField>
					<FormField label="Password" helperText="Revealing is its own control, never hover or focus.">
						<PasswordInput defaultValue="hunter2" />
					</FormField>
					<FormField label="Password, invalid" error="Too short.">
						<PasswordInput defaultValue="abc" invalid />
					</FormField>
					<FormField label="Weight" helperText="A trailing unit, outside the text.">
						<FieldShell end={<Text tag="span" size="xs" type="secondary">kg</Text>}>
							<Input type="number" defaultValue="12" />
						</FieldShell>
					</FormField>
					<FormField label="Character count">
						<Input showCharacterCount maxLength={40} defaultValue="Counted" />
					</FormField>
				</Stack>
			</Example>

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
