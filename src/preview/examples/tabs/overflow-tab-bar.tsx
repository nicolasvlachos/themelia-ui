import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { OverflowTabBar } from "themelia-ui/base/navigation"

export default function OverflowTabBarExample() {
	const [bar, setBar] = useState("overview")

	return (
		<OverflowTabBar
			strings={{ label: "Record sections" }}
			items={[
				{ id: "overview", label: "Overview" },
				{ id: "activity", label: "Activity", badge: <Badge tone="neutral">3</Badge> },
				{ id: "settings", label: "Settings" },
				{ id: "billing", label: "Billing" },
				{ id: "members", label: "Members" },
				{ id: "integrations", label: "Integrations" },
				{ id: "audit", label: "Audit log" },
				{ id: "danger", label: "Danger zone", disabled: true },
			]}
			value={bar}
			onValueChange={setBar}
		/>
	)
}
