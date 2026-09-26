import { Breadcrumbs } from "themelia-ui/base/navigation"

export default function BreadcrumbsExample() {
	return (
		<Breadcrumbs
			items={[
				{ label: "Home", href: "#" },
				{ label: "Orders", href: "#" },
				{ label: "Customers", href: "#" },
				{ label: "Order 4417" },
			]}
		/>
	)
}
