import { InventoryLevel } from "themelia-ui/admin/patterns/commerce"
import { AdaptiveGrid, GridCell } from "themelia-ui/base/structure"

export default function InventoryLevelExample() {
	return (
		<AdaptiveGrid minColumnWidth="lg" gap="xl">
			<GridCell>
				<InventoryLevel productName="Merino crew neck" variant="Medium / Charcoal" stock={8} reorderLevel={12} maxStock={120} lastRestocked="02 Aug" />
			</GridCell>
			<GridCell>
				<InventoryLevel productName="Oxford shirt" variant="Large / White" stock={0} reorderLevel={10} maxStock={80} lastRestocked="21 Jul" />
			</GridCell>
		</AdaptiveGrid>
	)
}
