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
				example="accordion/accordion"
				title="Accordion"
				description="Pass items for the canonical icon, title, badge, description row. Pass children instead when a section needs a structure the bounded row cannot express."
				stacked
			/>

			<Example
				example="accordion/accordion-surfaces"
				title="Accordion surfaces"
				description="Bordered is one shell with dividers; card gives each section its own panel; flat has no chrome at all."
				stacked
			/>

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
