import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Scope } from "themelia-ui/ui-provider"

import { InvoiceTable } from "./_shared"

export default function TableScale() {
	return (
		/*
		 * Both, captioned. On its own the scoped table just looked like a table —
		 * the section asserted a difference the page gave the reader no way to see.
		 */
		<Stack gap="lg" style={{ width: "100%" }}>
			<Stack gap="xs" style={{ width: "100%" }}>
				<Text size="xs" type="secondary">--density-scale: 1</Text>
				<InvoiceTable />
			</Stack>
			<Stack gap="xs" style={{ width: "100%" }}>
				<Text size="xs" type="secondary">--density-scale: 0.85</Text>
				<Scope vars={{ "--density-scale": 0.85 }} style={{ width: "100%" }}>
					<InvoiceTable />
				</Scope>
			</Stack>
		</Stack>
	)
}
