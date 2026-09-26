import { BookingCard } from "themelia-ui/admin/patterns/commerce"
import { Badge } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"
import { Money } from "themelia-ui/primitives"

export default function CatalogueBooking() {
	return (
		<Stack maxWidth="36rem" gap="none">
			<BookingCard
				title="Reservation #4417"
				description="Studio session, two hours"
				status={<Badge tone="success">Confirmed</Badge>}
				details={[
					{ id: "date", label: "Date", value: "02 Sep 2026, 09:30" },
					{ id: "customer", label: "Customer", value: "Alice Mercer" },
					{ id: "room", label: "Room", value: "Studio B" },
					{ id: "amount", label: "Amount", value: <Money amount={120} currency="EUR" /> },
					{ id: "note", label: "Note", value: "Needs the tall backdrop stand.", fullWidth: true },
				]}
				actionLabel="Open booking"
				onAction={() => toast("Open reservation #4417 requested")}
			/>
		</Stack>
	)
}
