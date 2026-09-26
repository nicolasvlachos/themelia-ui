import { useState } from "react"

import { Tab, TabList, TabPanel, Tabs } from "themelia-ui/base/navigation"
import { Text } from "themelia-ui/base/typography"

export default function TabsExample() {
	const [tab, setTab] = useState("overview")

	return (
		<>
			<Tabs value={tab} onValueChange={setTab} style={{ width: "100%" }}>
				<TabList label="Sections">
					<Tab value="overview">Overview</Tab>
					<Tab value="activity">Activity</Tab>
					<Tab value="settings">Settings</Tab>
					<Tab value="archived" disabled>
						Archived
					</Tab>
				</TabList>
				<TabPanel value="overview">
					<Text type="secondary">The overview panel.</Text>
				</TabPanel>
				<TabPanel value="activity">
					<Text type="secondary">The activity panel.</Text>
				</TabPanel>
				<TabPanel value="settings">
					<Text type="secondary">The settings panel.</Text>
				</TabPanel>
			</Tabs>

			<Tabs defaultValue="day" style={{ width: "100%" }}>
				<TabList variant="enclosed" label="Range">
					<Tab value="day">Day</Tab>
					<Tab value="week">Week</Tab>
					<Tab value="month">Month</Tab>
				</TabList>
				<TabPanel value="day">
					<Text type="secondary">Enclosed variant.</Text>
				</TabPanel>
				<TabPanel value="week">
					<Text type="secondary">Week.</Text>
				</TabPanel>
				<TabPanel value="month">
					<Text type="secondary">Month.</Text>
				</TabPanel>
			</Tabs>
		</>
	)
}
