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
				<PropTable owner="Email"
					rows={[
						{ name: "value", type: "string | null", description: "The address. Becomes both the text and the mailto href." },
						{ name: "display", type: "ReactNode", description: "Shown instead of the address. The href is still the address." },
						{ name: "subject / body", type: "string", description: "Prefills the message. Encoded into the mailto, not concatenated into it." },
					]}
				/>
			</Example>

			<Example id="phone-api" title="Phone API">
				<PropTable owner="Phone"
					rows={[
						{ name: "value", type: "string | null", description: "The number as stored. Displayed with its grouping; dialled without it." },
						{ name: "display", type: "ReactNode", description: "Shown instead of the number." },
					]}
				/>
			</Example>

			<Example id="url-api" title="Url and Link API">
				<PropTable owner="Url"
					rows={[
						{ name: "value", type: "string | null", description: "The address. The host is shown; the whole thing stays in the href." },
						{ name: "display", type: "ReactNode", description: "Shown instead of the host." },
						{ name: "external", type: "boolean", default: "false", description: "Opens in a new tab WITH rel=noopener noreferrer. The two are not separable." },
						{ name: "Link", type: "component", description: "The plain anchor the three contact primitives are built on." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
