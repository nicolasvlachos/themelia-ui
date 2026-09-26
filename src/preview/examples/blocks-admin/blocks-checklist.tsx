import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Checklist } from "themelia-ui/patterns/onboarding"

export default function BlocksChecklist() {
	return (
		<Checklist
			steps={[
				{ id: "1", status: "completed", title: "Create your workspace", content: <Text type="secondary">Named and provisioned in eu-west-1.</Text> },
				{ id: "2", status: "completed", title: "Invite your team", content: <Text type="secondary">Four people accepted.</Text> },
				{
					id: "3",
					status: "inProgress",
					title: "Connect a data source",
					badge: <Badge tone="warning">Required</Badge>,
					content: (
						<Stack gap="md">
							<Text type="secondary">Pick where your data lives. You can add more later.</Text>
							<Stack direction="horizontal" gap="sm" wrap>
								<Button tone="primary">Connect Postgres</Button>
								<Button tone="secondary" buttonStyle="outline">Upload a CSV</Button>
							</Stack>
						</Stack>
					),
				},
				{ id: "4", status: "pending", title: "Publish your first dashboard", content: <Text type="secondary">Start from a template.</Text> },
			]}
		/>
	)
}
