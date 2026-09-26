import { Breadcrumbs } from "@/components/base/navigation"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BreadcrumbsPage() {
	return (
		<ComponentPage
			title="Breadcrumbs"
			summary="The trail to the current page. Separators are aria-hidden, so it is not announced as “Home slash Orders slash”."
			importPath="@/components/base/navigation"
			exports={["Breadcrumbs"]}
		>
			<Example
				id="breadcrumbs"
				title="Breadcrumbs"
				description="The current page is a span, not a link. Linking to the page you are already on is a dead control, and assistive technology announces it as somewhere to go."
				stacked
				code={`<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: "Order 4417" },
  ]}
/>`}
			>
				<Breadcrumbs
					items={[
						{ label: "Home", href: "#" },
						{ label: "Orders", href: "#" },
						{ label: "Customers", href: "#" },
						{ label: "Order 4417" },
					]}
				/>
			</Example>

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
