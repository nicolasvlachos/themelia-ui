import { useState } from "react"

import { InventorySection, type InventorySectionValue } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"

const INVENTORY: InventorySectionValue = {
	sku: "MRN-CRW-M-CHR",
	barcode: "5012345678900",
	trackQuantity: true,
	available: "84",
	committed: "12",
	incoming: "60",
	lowStockThreshold: "20",
	inventoryPolicy: "deny",
	binLocation: "A-14-3",
	requiresShipping: true,
	weight: "0.42",
	countryOfOrigin: "Portugal",
	hsCode: "6110.11",
	tags: ["knitwear", "core", "autumn"],
}

function InventoryDemo() {
	const [value, setValue] = useState(INVENTORY)
	return (
		<InventorySection
			value={value}
			onFieldChange={({ field, value: next }) => setValue((current) => ({ ...current, [field]: next }))}
		/>
	)
}

export default function CatalogueInventory() {
	return (
		<Stack maxWidth="40rem" gap="none">
			<InventoryDemo />
		</Stack>
	)
}
