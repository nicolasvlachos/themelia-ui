import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import { Input } from "themelia-ui/base/text-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { ActionSheet } from "themelia-ui/features/overlays"

import { wait } from "./data"

export default function ActionSheetExample() {
	return (
		<Stack direction="horizontal" gap="lg" wrap>
			<ActionSheet
				title="Edit invoice"
				description="Longer work than a dialog comfortably holds."
				trigger={<Button tone="neutral" buttonStyle="outline">Modal sheet</Button>}
				onAsyncConfirm={() => wait(700)}
			>
				<Stack gap="md">
					<FormField label="Reference">
						<Input defaultValue="INV-4417" />
					</FormField>
					<FormField label="Customer">
						<Input defaultValue="Northwind Traders" />
					</FormField>
				</Stack>
			</ActionSheet>

			<ActionSheet
				title="Filters"
				description="The page stays interactive behind it."
				modality="non-modal"
				showFooter={false}
				inset
				trigger={<Button tone="neutral" buttonStyle="outline">Non-modal inspector</Button>}
			>
				<Text size="sm" type="secondary">
					Scroll and click the page behind this panel — it is not inert.
				</Text>
			</ActionSheet>
		</Stack>
	)
}
