import { BuildingIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { MetadataList } from "themelia-ui/base/display"
import { ResourceDetailsSection, ResourceHeader, ResourceShowShell } from "themelia-ui/features/resource"

import { DETAILS } from "./data"

export default function ResourceShow() {
	return (
		<ResourceShowShell
			slots={{
				header: (
					<ResourceHeader
						eyebrow="Northwind Traders"
						title="INV-4417"
						description="Issued 14 August, due 28 August."
						icon={BuildingIcon}
						badges={<Badge tone="destructive">Overdue</Badge>}
						metadata={<MetadataList layout="inline" itemSeparator items={[
							{ label: "Amount", value: { kind: "money", value: 48_200, currency: "USD" } },
							{ label: "Terms", value: "Net 14" },
						]} />}
						actions={<Button tone="neutral" appearance="outline">Send reminder</Button>}
					/>
				),
				aside: (
					<ResourceDetailsSection
						title="Payment"
						metadata={[
							{ label: "Method", value: "Bank transfer" },
							{ label: "Received", value: null },
						]}
						metadataColumns={1}
						metadataDense
					/>
				),
			}}
		>
			<ResourceDetailsSection
				title="Details"
				description="Everything recorded against this invoice."
				metadata={DETAILS}
				metadataColumns={2}
				help="Amounts exclude tax and any credit applied at settlement."
			/>
		</ResourceShowShell>
	)
}
