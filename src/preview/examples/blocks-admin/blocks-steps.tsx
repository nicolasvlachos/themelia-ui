import { Stack } from "themelia-ui/base/structure"
import { Steps, StepsBar, type Step } from "themelia-ui/patterns/timelines"

const STEPS: Step[] = [
	{ id: "1", title: "Create your workspace", description: "Name it and pick a region.", status: "completed", timestamp: "Done 14 Aug" },
	{ id: "2", title: "Invite your team", description: "Add the people who need access.", status: "completed", timestamp: "Done 15 Aug" },
	{ id: "3", title: "Connect a data source", description: "Postgres, BigQuery, or a CSV upload.", status: "current", badge: "Required" },
	{ id: "4", title: "Publish your first dashboard", description: "Pick a template or start empty.", status: "upcoming" },
]

export default function BlocksSteps() {
	return (
		<Stack gap="2xl">
			<StepsBar steps={STEPS} />
			<Steps steps={STEPS} />
		</Stack>
	)
}
