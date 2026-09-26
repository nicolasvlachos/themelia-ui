import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveNamePage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-name/name"
				title="Name"
				description="Whitespace is collapsed and the parts are ordered by the format asked for. The stored value is never rewritten — this is a rendering, not a migration."
			/>

			<Example
				example="primitive-name/initials"
				title="Initials"
				description="The strategy decides which characters are taken — first and last, the first two words, the first letter alone. Deriving rather than storing is the whole point: a name that is corrected corrects its initials with it."
			/>

			<Example id="name-api" title="Name API">
				<PropTable owner="Name" />
				<PropTable symbols={["formatName"]} />
			</Example>

			<Example id="initials-api" title="Initials API">
				<PropTable owner="Initials" />
				<PropTable symbols={["formatInitials"]} />
			</Example>
		</ComponentPage>
	)
}
