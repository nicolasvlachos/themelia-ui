import { FileTextIcon } from "lucide-react"

import { PageActions, PageHeader } from "themelia-ui/layout/page"

import { RECORD_ACTIONS } from "./data"

export default function PageHeaderExample() {
	return (
		<div style={{ width: "100%" }}>
			<PageHeader
				level={2}
				backHref="#/page"
				strings={{ back: "Back to invoices" }}
				titleIcon={FileTextIcon}
				title="Invoice #4417"
				titleBadges={[{ label: "Paid", tone: "success" }, { label: "Net 30" }]}
				description="Northwind Traders — issued 1 September 2026."
				actions={<PageActions actions={RECORD_ACTIONS} />}
				withSeparator
			/>
		</div>
	)
}
