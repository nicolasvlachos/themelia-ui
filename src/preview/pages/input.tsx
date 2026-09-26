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
				<PropTable owner="Input" />
				<PropTable symbols={["FieldShell", "useFieldValue"]} />
			</Example>

			<Example id="search-api" title="SearchInput API">
				<PropTable owners={["SearchInput"]} />
			</Example>

			<Example id="password-api" title="PasswordInput API">
				<PropTable owners={["PasswordInput"]} />
			</Example>
		</ComponentPage>
	)
}
