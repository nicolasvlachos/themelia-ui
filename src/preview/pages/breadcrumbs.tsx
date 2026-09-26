import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BreadcrumbsPage() {
	return (
		<ComponentPage>
			<Example
				example="breadcrumbs/breadcrumbs"
				title="Breadcrumbs"
				description="The current page is a span, not a link. Linking to the page you are already on is a dead control, and assistive technology announces it as somewhere to go."
			/>

			<Example id="breadcrumbs-api" title="API">
				<PropTable owners={["Breadcrumbs", "Crumb"]} />
			</Example>
		</ComponentPage>
	)
}
