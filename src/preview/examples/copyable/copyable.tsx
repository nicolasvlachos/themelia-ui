import { Card } from "themelia-ui/base/cards"
import { Copyable } from "themelia-ui/base/copyable"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Email, MonoValue } from "themelia-ui/primitives"


export default function CopyableExample() {
	return (
		<Card surface="bordered" style={{ maxWidth: "26rem", width: "100%" }}>
			<Stack gap="md">
				<Stack gap="2xs">
					<Text size="xs" type="secondary">
						API key
					</Text>
					<Copyable value="key_live_9f2c4b1e77a0d3f8b6c5a41d0e73b28c9f4610d7" mono truncate />
				</Stack>
				<Stack gap="2xs">
					<Text size="xs" type="secondary">
						Billing contact
					</Text>
					<Copyable
						value="jane@northwind.example"
						displayValue={<Email value="jane@northwind.example" />}
					/>
				</Stack>
				<Stack gap="2xs">
					<Text size="xs" type="secondary">
						Workspace id
					</Text>
					<Copyable
						value="ws_01J8Z9K2QW"
						displayValue={<MonoValue>ws_01J8Z9K2QW</MonoValue>}
					/>
				</Stack>
			</Stack>
		</Card>
	)
}
