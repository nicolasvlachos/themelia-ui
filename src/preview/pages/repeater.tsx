import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function RepeaterPage() {
	return (
		<ComponentPage>
			<Example
				example="repeater/repeater"
				title="Repeater"
				description="The base component. It does not own the array — you pass items and the handlers, which is what keeps it usable with a form library or with plain state. Supplying onMove is what enables reordering and renders the handle."
			/>

			<Example
				example="repeater/string-repeater"
				title="StringRepeater"
				description="A repeater of plain strings, which is most of them — domains, tags, recipients. Reordering is the native drag API plus arrow keys on the handle. A pointer library brings its own dependency and, on its own, no keyboard story — and reordering is exactly what a keyboard user cannot improvise."
			/>

			<Example
				example="repeater/key-value"
				title="KeyValueEditor"
				description="Pairs rather than an object, because an object cannot hold a half-typed key: clearing one to retype it would lose the row and its value with it. Duplicate keys are flagged as you type."
			/>

			<Example
				example="repeater/localized"
				title="LocalizedStringField"
				description="One value per locale, behind a locale switcher, so a translated field costs one row instead of one row per language. The value is an object keyed by locale code."
			/>

			<Example id="repeater-rule" title="It never owns the array">
				<Callout label="Rule">
					Every repeater is controlled. It takes the items and the handlers and renders
					them; it keeps no copy. A component that owned the list would have to
					reconcile with whatever the form library also thinks the list is, and the two
					drift the first time a reset or a server round-trip happens.
				</Callout>
			</Example>

			<Example id="repeater-api" title="API">
				<PropTable owners={["Repeater", "StringRepeater", "KeyValueEditor", "LocalizedStringField", "ObjectRepeater"]} />
				<PropTable symbols={["LocalizedStringRepeater", "LocalizedObjectField"]} />
			</Example>
		</ComponentPage>
	)
}
