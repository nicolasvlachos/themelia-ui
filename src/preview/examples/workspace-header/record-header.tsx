import { Avatar, AvatarFallback } from "themelia-ui/base/avatar"
import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { WorkspaceRecordHeader } from "themelia-ui/layout/workspace"
import { Money } from "themelia-ui/primitives"

export default function RecordHeader() {
	return (
		<Card surface="bordered" style={{ width: "100%" }}>
			<WorkspaceRecordHeader
				title="Invoice #4417"
				description="Northwind Traders — issued 1 September 2026."
				media={
					<Avatar>
						<AvatarFallback>NT</AvatarFallback>
					</Avatar>
				}
				badges={<Badge tone="success" dot>Paid</Badge>}
				metadata={[
					{ label: "Owner", value: "Jane McDonald" },
					{ label: "Amount", value: <Money amount={1299.5} currency="EUR" /> },
					{ label: "Terms", value: "Net 30" },
				]}
				actions={
					<>
						<Button tone="neutral" appearance="outline">Duplicate</Button>
						<Button>Edit</Button>
					</>
				}
			/>
		</Card>
	)
}
