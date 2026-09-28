import { VendorProfile } from "themelia-ui/blocks/admin/commerce"
import { ContentBlock } from "themelia-ui/base/display"
import { AdaptiveGrid } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"
import { Number as NumberValue } from "themelia-ui/primitives"

export default function CatalogueVendor() {
	return (
		<AdaptiveGrid minColumnWidth="20rem" align="start">
			<ContentBlock surface="bordered">
				<VendorProfile
					name="Northwind Traders"
					role="Knitwear · Portugal"
					verified
					earnings="48,200.00 EUR"
					metrics={[
						{ id: "1", label: "Lead time", value: "6 days" },
						{ id: "2", label: "Fill rate", value: "98.2%" },
						{ id: "3", label: "Open disputes", value: "0" },
					]}
					stats={[
						{ id: "1", label: "On-time", value: "96%", change: "+2pp", changeTone: "success" },
						{ id: "2", label: "Returns", value: "1.8%", change: "+0.4pp", changeTone: "warning" },
						{ id: "3", label: "Orders", value: <NumberValue value={1284} size="inherit" weight="semibold" /> },
						{ id: "4", label: "Rating", value: "4.7 / 5" },
					]}
					onMessage={() => toast("Supplier selected", { description: "Ready to start a conversation." })}
					onHire={() => toast("Supplier selected", { description: "Ready to start onboarding." })}
				/>
			</ContentBlock>
			<ContentBlock surface="bordered">
				<VendorProfile
					name="Bansko Textiles"
					role="Cut and sew · Bulgaria"
					metrics={[
						{ id: "1", label: "Lead time", value: "11 days" },
						{ id: "2", label: "Fill rate", value: "91.0%" },
					]}
					onMessage={() => toast("Supplier selected", { description: "Ready to start a conversation." })}
				/>
			</ContentBlock>
		</AdaptiveGrid>
	)
}
