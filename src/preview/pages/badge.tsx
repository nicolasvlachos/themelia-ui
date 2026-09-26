import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BadgePage() {
	return (
		<ComponentPage>
			<Example
				example="badge/badge-tones"
				title="Tones"
				description="Seven tones across three variants. The tone supplies the hue; the variant decides how much of it is applied — soft for a label in a table, solid for a mark that must be found at a glance, outline for one that must not compete with the row it sits in."
			/>

			<Example
				example="badge/badge-dot"
				title="Status dot"
				description="A filled dot for a state that has happened, a hollow one for a state that has not, and a pulse for one that is changing. The shape carries the difference so it survives being printed, screenshotted, or read by someone who cannot separate the hues."
			/>

			<Example id="badge-rule" title="Tone, never variant, for colour">
				<Callout label="Rule">
					Colour is always <code>tone</code>, and <code>variant</code> is structure alone:{" "}
					<code>variant="destructive"</code> would be a semantic colour wearing the name of a
					structural prop. The names are the kit's — <code>neutral</code>, never a{" "}
					<code>default</code> that says nothing.
				</Callout>
			</Example>

			<Example id="badge-api" title="API">
				<PropTable owner="Badge" />
			</Example>
		</ComponentPage>
	)
}
