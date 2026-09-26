import { LogOutIcon, PencilIcon, TrashIcon } from "lucide-react"

import { Card } from "themelia-ui/base/cards"
import { Text } from "themelia-ui/base/typography"

export default function MenusInContext() {
	return (
		<Card
			surface="bordered"
			title="Northwind Traders"
			description="Customer since 2019"
			actions={[
				{ label: "Edit", icon: PencilIcon, onClick: () => {} },
				{ label: "Sign out of all sessions", icon: LogOutIcon, onClick: () => {}, group: true },
				{ label: "Delete customer", icon: TrashIcon, onClick: () => {}, tone: "destructive" },
			]}
			style={{ maxWidth: "26rem" }}
		>
			<Text size="sm" type="secondary">
				The header menu is an ActionMenu — the card passes its actions straight through.
			</Text>
		</Card>
	)
}
