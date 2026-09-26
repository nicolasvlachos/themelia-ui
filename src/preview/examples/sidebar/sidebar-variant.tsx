import { Stack } from "themelia-ui/base/structure"

import { Panel } from "./_shared"

export default function SidebarVariantExample() {
	return (
		<Stack gap="xl">
			<Panel variant="floating" />
			<Panel variant="inset" />
		</Stack>
	)
}
