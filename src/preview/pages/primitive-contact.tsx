import { Email, Phone, Url } from "@/components/primitives"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

export function PrimitiveContactPage() {
	return (
		<ComponentPage
			title="Contact: email, phone & URL"
			summary="A contact detail as the anchor that acts on it — mailto for an email, tel for a phone number, href for a URL. All three are built on Link and share one rule: the text can be shortened or regrouped for a reader, and the target is always built from the full value, never from the text."
			importPath="@/components/primitives"
			exports={["Email", "Phone", "Url", "Link"]}
		>
			<Example
				id="email"
				title="Email"
				description="The address is the label and the href, so what is read aloud, what is copied, and what is dialled are the same string. An absent address renders as an empty value rather than as a link to nowhere."
				stacked
				code={`<Email value="jane@northwind.example" />
<Email value="raj@northwind.example" display="Raj Patel" />
<Email value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Email value="jane@northwind.example" />`, value: <Email value="jane@northwind.example" /> },
						{ code: `<Email value="raj@northwind.example" display="Raj Patel" />`, value: <Email value="raj@northwind.example" display="Raj Patel" /> },
						{ code: `<Email value={null} />`, value: <Email value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="phone"
				title="Phone"
				description="Spaces and dashes help a reader and break a dialler, so the href is stripped to what a phone can actually call while the text keeps its grouping. Writing the anchor by hand is where those two quietly become the same string."
				stacked
				code={`<Phone value="+31 6 1234 5678" />
<Phone value="+1 (555) 010-4417" />
<Phone value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Phone value="+31 6 1234 5678" />`, value: <Phone value="+31 6 1234 5678" /> },
						{ code: `<Phone value="+1 (555) 010-4417" />`, value: <Phone value="+1 (555) 010-4417" /> },
						{ code: `<Phone value={null} />`, value: <Phone value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="url"
				title="URL"
				description="external adds the target and the rel that has to accompany it. A link opening a new tab without rel=noopener hands the opened page a reference back to yours."
				stacked
				code={`<Url value="https://northwind.example/invoices/4417" />
<Url value="https://northwind.example/invoices/4417" external />
<Url value="https://northwind.example" display="Northwind" />
<Url value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Url value="https://northwind.example/invoices/4417" />`, value: <Url value="https://northwind.example/invoices/4417" /> },
						{ code: `<Url value="https://northwind.example/invoices/4417" external />`, value: <Url value="https://northwind.example/invoices/4417" external /> },
						{ code: `<Url value="https://northwind.example" display="Northwind" />`, value: <Url value="https://northwind.example" display="Northwind" /> },
						{ code: `<Url value={null} />`, value: <Url value={null} /> },
					]}
				/>
			</Example>

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
