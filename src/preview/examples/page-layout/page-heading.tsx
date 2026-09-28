import { Button } from "themelia-ui/base/buttons"
import { Breadcrumbs, PageHeading } from "themelia-ui/base/navigation"

export default function PageHeadingExample() {
	return (
		<div style={{ width: "100%" }}>
			<PageHeading
				breadcrumbs={
					<Breadcrumbs items={[{ label: "Billing", href: "#/page" }, { label: "Invoices" }]} />
				}
				eyebrow="Workspace"
				title="Invoices"
				badges={[{ label: "Live", tone: "success" }]}
				description="Everything issued in this workspace, newest first."
				actions={
					<>
						<Button tone="neutral" appearance="outline">Export</Button>
						<Button>New invoice</Button>
					</>
				}
				withSeparator
			/>
		</div>
	)
}
