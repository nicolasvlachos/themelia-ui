import { Button } from "themelia-ui/base/buttons"
import { Card, CardContent } from "themelia-ui/base/cards"
import { FormActionsBar } from "themelia-ui/base/forms"
import { Text } from "themelia-ui/base/typography"

export default function FormActions() {
	return (
		<Card style={{ maxWidth: "34rem" }}>
			<CardContent>
				<FormActionsBar
					leading={
						<Text size="xs" type="secondary">
							Saved 2 minutes ago
						</Text>
					}
				>
					<Button tone="neutral" buttonStyle="outline">
						Discard
					</Button>
					<Button>Save</Button>
				</FormActionsBar>
			</CardContent>
		</Card>
	)
}
