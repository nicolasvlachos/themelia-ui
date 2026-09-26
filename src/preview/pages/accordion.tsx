import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AccordionPage() {
	return (
		<ComponentPage>
			<Example
				example="accordion/accordion"
				title="Accordion"
				description="Pass items for the canonical icon, title, badge, description row. Pass children instead when a section needs a structure the bounded row cannot express."
			/>

			<Example
				example="accordion/accordion-surfaces"
				title="Accordion surfaces"
				description="Bordered is one shell with dividers; card gives each section its own panel; flat has no chrome at all."
			/>

			<Example id="accordion-api" title="API">
				<PropTable owner="Accordion" />
			</Example>
		</ComponentPage>
	)
}
