import { Accordion } from "@/components/base/accordion"
import { Badge } from "@/components/base/badge"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AccordionPage() {
	return (
		<ComponentPage
			title="Accordion"
			summary="Bounded sections that open one at a time, or several. Height is transitioned rather than keyframed, so an interrupted open reverses from where it actually is."
			importPath="@/components/base/accordion"
			exports={["Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent"]}
		>
			<Example
				id="accordion"
				title="Accordion"
				description="Pass items for the canonical icon, title, badge, description row. Pass children instead when a section needs a structure the bounded row cannot express."
				stacked
				code={`<Accordion
  items={[
    { value: "billing", title: "Billing", description: "…", content: <…/> },
  ]}
/>`}
			>
				<Accordion
					defaultValue={["billing"]}
					style={MEASURE.wide}
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
			</Example>

			<Example
				id="accordion-surfaces"
				title="Accordion surfaces"
				description="Bordered is one shell with dividers; card gives each section its own panel; flat has no chrome at all."
				stacked
			>
				<Stack gap="xl" style={MEASURE.wide}>
					{(["bordered", "card", "flat"] as const).map((surface) => (
						<Stack key={surface} gap="sm">
							<Text size="xs" type="secondary">
								{surface}
							</Text>
							<Accordion
								surface={surface}
								items={[
									{ value: "a", title: "First section", content: "Body copy." },
									{ value: "b", title: "Second section", content: "Body copy." },
								]}
							/>
						</Stack>
					))}
				</Stack>
			</Example>

			<Example id="accordion-api" title="API">
				<PropTable owner="Accordion"
					rows={[
						{ name: "items", type: "AccordionItemData[]", description: "Bounded sections. Ignored when children are supplied." },
						{ name: "surface", type: '"bordered" | "card" | "flat"', default: '"bordered"', description: "Group chrome. Resolves through the provider when omitted." },
						{ name: "media", type: '"inline" | "medallion" | "none"', default: '"inline"', description: "How leading icons are framed. The column is dropped entirely when no item has one." },
						{ name: "multiple", type: "boolean", default: "false", description: "Allows more than one section open at a time." },
						{ name: "defaultValue / value", type: "string | string[]", description: "Which sections start open, or the controlled set." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
