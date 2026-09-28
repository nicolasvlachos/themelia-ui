import { UpcomingBookings, type Booking } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"

const BOOKINGS: Booking[] = [
	{ id: "1", date: "2026-09-02", time: "09:30", service: "Studio session", customer: "Alice Mercer", amount: "120.00 EUR" },
	{ id: "2", date: "2026-09-02", time: "14:00", service: "Equipment hire", customer: "Contoso Ltd", amount: "48.00 EUR" },
	{ id: "3", date: "2026-09-04", time: "11:15", service: "Consultation", customer: "Northwind Traders", amount: "90.00 EUR" },
]

export default function UpcomingBookingsExample() {
	return (
		<Stack maxWidth="40rem" gap="none">
			<UpcomingBookings bookings={BOOKINGS} boxedDate />
		</Stack>
	)
}
