import { MetadataList } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { DataTable } from "themelia-ui/features/table"

import { tableColumns } from "./_shared"
import { BOOKINGS, type Booking } from "./data"

interface BookingDetail {
	event: string
	deposit: string
	arrival: string
	notes: string
}

const DETAILS: Record<string, BookingDetail> = {
	b1: { event: "Autumn gala", deposit: "€2,400 paid", arrival: "17:00, main entrance", notes: "Needs step-free access to the terrace." },
	b2: { event: "Book launch", deposit: "Awaiting payment", arrival: "18:30, side door", notes: "A signing table by the window." },
	b3: { event: "Wedding reception", deposit: "€5,000 paid", arrival: "14:00, river gate", notes: "The band loads in through the courtyard." },
	b5: { event: "Team offsite", deposit: "€420 paid", arrival: "09:00, main entrance", notes: "A projector and two flip charts." },
	b6: { event: "Charity dinner", deposit: "Awaiting payment", arrival: "19:00, main entrance", notes: "Auction tables along the east wall." },
}

const attempts = new Map<string, number>()

/** A stand-in API: some latency, and The Old Granary's first load fails, so Retry has something to recover. */
function fetchBookingDetail(booking: Booking, signal: AbortSignal): Promise<BookingDetail | null> {
	return new Promise((resolve, reject) => {
		const timer = window.setTimeout(() => {
			const attempt = (attempts.get(booking.id) ?? 0) + 1
			attempts.set(booking.id, attempt)
			if (booking.id === "b2" && attempt === 1) reject(new Error("The booking service timed out."))
			else resolve(DETAILS[booking.id] ?? null)
		}, 700)
		// Closing the row aborts: the request stops, and nothing is written after it.
		signal.addEventListener("abort", () => {
			window.clearTimeout(timer)
			reject(new DOMException("Aborted", "AbortError"))
		})
	})
}

export default function TableExpandableAsync() {
	return (
		<DataTable
			columns={tableColumns}
			data={BOOKINGS}
			getRowId={(row) => row.id}
			enableRowSelection
			stickyFirstColumn
			expandedRow={{
				onLoad: (booking, { signal }) => fetchBookingDetail(booking, signal),
				render: (_booking, { detail }) => (
					<Stack gap="sm">
						<MetadataList
							layout="grid"
							columns={3}
							items={[
								{ label: "Event", value: detail.event },
								{ label: "Deposit", value: detail.deposit },
								{ label: "Arrival", value: detail.arrival },
							]}
						/>
						<Text size="sm" type="secondary">{detail.notes}</Text>
					</Stack>
				),
				// A cancelled booking has nothing left to show.
				canExpand: (booking) => booking.status !== "cancelled",
				multiple: false,
			}}
		/>
	)
}
