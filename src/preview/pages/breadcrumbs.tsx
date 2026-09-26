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
				<PropTable owner="Breadcrumbs"
					rows={[
						{ name: "items", type: "Crumb[]", required: true, description: "The trail. The last entry renders as the current page." },
						{ name: "Crumb.render", type: "ReactElement", description: "A router link element, so the library never imports a router." },
						{ name: "Crumb.label", type: "ReactNode", description: "What the crumb reads as." },
						{ name: "separator", type: "ReactNode", description: "Replaces the chevron between crumbs. It is decorative either way — the trail's meaning is in the links." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
