import { useState } from "react"

import { Switch } from "themelia-ui/base/choice-inputs"
import { Tab, TabList, Tabs } from "themelia-ui/base/navigation"
import { Stack } from "themelia-ui/base/structure"

export default function TabsScroll() {
	const [edgeFade, setEdgeFade] = useState(true)

	return (
		<>
			<Switch checked={edgeFade} onChange={event => setEdgeFade(event.target.checked)} label="Fade overflowing edges" />
			<Stack maxWidth="22rem">
				<Tabs defaultValue="overview">
					<TabList label="Scrollable sections" variant="enclosed" edgeFade={edgeFade}>
						{["Overview", "Activity", "Settings", "Billing", "Members", "Integrations", "Audit log"].map(label => <Tab key={label} value={label.toLowerCase()}>{label}</Tab>)}
					</TabList>
				</Tabs>
			</Stack>
		</>
	)
}
