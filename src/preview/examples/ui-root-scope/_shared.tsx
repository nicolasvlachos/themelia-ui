import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card, CardContent } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { Text } from "themelia-ui/base/typography"

/** One set of controls, so a scope's effect is the only thing that differs between cards. */
export function Sample({ label }: { label: string }) {
	return (
		<Card>
			<CardContent>
				<Stack gap="md">
					<Text size="xs" type="secondary">
						{label}
					</Text>
					<Input placeholder="Search orders" aria-label={`Search in ${label}`} />
					<Stack direction="horizontal" gap="sm" align="center">
						<Button>Save</Button>
						<Button tone="neutral" buttonStyle="outline">
							Cancel
						</Button>
						<Badge tone="success">Live</Badge>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	)
}
