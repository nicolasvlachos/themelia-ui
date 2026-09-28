import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { PillRadioGroup } from "themelia-ui/base/choice-inputs"
import { WorkspaceRecordHeader } from "themelia-ui/layout/workspace"

function ViewSwitch() {
	const [view, setView] = useState<string | null>("logs")
	return (
		<PillRadioGroup
			value={view}
			onValueChange={setView}
			options={[
				{ value: "logs", label: "Logs" },
				{ value: "assets", label: "Assets" },
				{ value: "timing", label: "Timing" },
			]}
		/>
	)
}

export default function RecordHeaderSecondary() {
	return (
		<Card surface="bordered" style={{ width: "100%" }}>
			<WorkspaceRecordHeader
				title="Deployment 41a9c2"
				headingLevel={2}
				description="main → production, 4 minutes ago."
				badges={<Badge tone="warning" dot pulse>Building</Badge>}
				metadata={[
					{ label: "Branch", value: "main" },
					{ label: "Author", value: "Raj Patel" },
				]}
				actions={<Button tone="neutral" appearance="outline">Cancel</Button>}
				secondaryActions={<ViewSwitch />}
			/>
		</Card>
	)
}
