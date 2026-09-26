import { Accordion } from "themelia-ui/base/accordion"
import { Badge } from "themelia-ui/base/badge"


export default function AccordionExample() {
	return (
		<Accordion
			defaultValue={["billing"]}
			style={{ maxWidth: "34rem", width: "100%" }}
			items={[
				{
					value: "billing",
					title: "Billing",
					description: "Payment method, invoices, and tax details",
					badge: <Badge tone="neutral">Updated</Badge>,
					content:
						"Invoices are issued on the first of the month and charged to the card on file. Changing the card mid-cycle does not re-issue the open invoice.",
				},
				{
					value: "members",
					title: "Members",
					description: "Who can sign in and what they can do",
					content:
						"Members inherit the workspace role unless a project overrides it. Removing a member revokes their sessions immediately.",
				},
				{
					value: "api",
					title: "API access",
					description: "Keys, scopes, and rate limits",
					disabled: true,
					content: "Available on the Team plan.",
				},
			]}
		/>
	)
}
