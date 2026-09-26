import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveContactPage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-contact/email"
				title="Email"
				description="The address is the label and the href, so what is read aloud, what is copied, and what is dialled are the same string. An absent address renders as an empty value rather than as a link to nowhere."
			/>

			<Example
				example="primitive-contact/phone"
				title="Phone"
				description="Spaces and dashes help a reader and break a dialler, so the href is stripped to what a phone can actually call while the text keeps its grouping. Writing the anchor by hand is where those two quietly become the same string."
			/>

			<Example
				example="primitive-contact/url"
				title="URL"
				description="external adds the target and the rel that has to accompany it. A link opening a new tab without rel=noopener hands the opened page a reference back to yours."
			/>

			<Example id="email-api" title="Email API">
				<PropTable owner="Email" />
			</Example>

			<Example id="phone-api" title="Phone API">
				<PropTable owner="Phone" />
			</Example>

			<Example id="url-api" title="Url and Link API">
				<PropTable owner="Url" />
				<PropTable symbols={["Link"]} />
			</Example>
		</ComponentPage>
	)
}
