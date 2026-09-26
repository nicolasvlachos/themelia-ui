import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { Text } from "themelia-ui/base/typography"
import { ResourceDetailsSection, TabbedResourceShell } from "themelia-ui/features/resource"

import { DETAILS } from "./data"

const TABS = [
	{ id: "overview", label: "Overview" },
	{ id: "lines", label: "Line items", badge: <Badge tone="neutral">7</Badge> },
	{ id: "payments", label: "Payments" },
	{ id: "history", label: "History" },
]

export default function TabbedResource() {
	const [tab, setTab] = useState("overview")

	return (
		<TabbedResourceShell
			title="INV-4417"
			description="Northwind Traders · Net 14"
			tabs={TABS}
			activeTab={tab}
			onTabChange={setTab}
			strings={{ tabsLabel: "Invoice sections" }}
		>
			<ResourceDetailsSection
				title={TABS.find((item) => item.id === tab)?.label}
				metadata={tab === "overview" ? DETAILS : undefined}
				body={tab === "overview" ? undefined : <Text type="secondary">Nothing recorded on this tab yet.</Text>}
			/>
		</TabbedResourceShell>
	)
}
