import { CheckIcon, CircleIcon } from "lucide-react"

import { Accordion } from "themelia-ui/base/accordion"
import { Button } from "themelia-ui/base/buttons"
import { IconBadge } from "themelia-ui/base/display"
import { Progress } from "themelia-ui/base/feedback"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ChecklistBlueprint() {
	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<Progress value={1} max={3} label="1 of 3 steps complete" />
			<Accordion
				media="medallion"
				defaultValue={["invite"]}
				items={[
					{
						value: "profile",
						title: "Complete your profile",
						icon: <IconBadge icon={CheckIcon} tone="success" shape="circle" />,
						content: <Text type="secondary">Name, avatar and time zone are set.</Text>,
					},
					{
						value: "invite",
						title: "Invite your team",
						icon: <IconBadge icon={CircleIcon} shape="circle" />,
						content: (
							<Stack gap="sm" align="start">
								<Text type="secondary">Teammates see the same projects and saved views.</Text>
								<Button>Send invites</Button>
							</Stack>
						),
					},
					{
						value: "connect",
						title: "Connect a data source",
						icon: <IconBadge icon={CircleIcon} shape="circle" />,
						content: <Text type="secondary">Postgres, a CSV upload or the REST API.</Text>,
					},
				]}
			/>
		</Stack>
	)
}
