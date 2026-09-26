import { InvoiceMini } from "themelia-ui/admin/patterns/commerce"
import { ContentBlock } from "themelia-ui/base/display"
import { AdaptiveGrid, GridCell } from "themelia-ui/base/structure"

export default function InvoiceMiniExample() {
	return (
		<AdaptiveGrid minColumnWidth="md" gap="xl">
			<GridCell>
				<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0114" status="overdue" customerName="Adventure Park Bansko" lineCount={3} dueAt="28 Aug" total="3,120.00 EUR" /></ContentBlock>
			</GridCell>
			<GridCell>
				<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0115" status="pending" customerName="Northwind Traders" lineCount={1} dueAt="04 Sep" total="900.00 EUR" /></ContentBlock>
			</GridCell>
			<GridCell>
				<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0392" status="paid" customerName="Contoso Ltd" lineCount={7} dueAt="12 Aug" total="12,480.00 EUR" /></ContentBlock>
			</GridCell>
		</AdaptiveGrid>
	)
}
