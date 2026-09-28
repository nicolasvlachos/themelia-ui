import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIScope } from "themelia-ui/ui-provider"

import { InvoiceTable } from "./_shared"

export default function TableScale() {
	return (
		/*
		 * Both, captioned. On its own the scoped table just looked like a table —
		 * the section asserted a difference the page gave the reader no way to see.
		 */
		<Stack style={{ width: "100%" }}>
			<Stack gap="sm" style={{ width: "100%" }}>
				<Text size="xs" type="secondary">density: default</Text>
				<InvoiceTable />
			</Stack>
			<Stack gap="sm" style={{ width: "100%" }}>
				<Text size="xs" type="secondary">density: compact</Text>
				<UIScope config={{ density: "compact" }} style={{ width: "100%" }}>
					<InvoiceTable />
				</UIScope>
			</Stack>
		</Stack>
	)
}
