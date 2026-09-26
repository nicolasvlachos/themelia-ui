import type { FilterTab } from "themelia-ui/features/filters"

export interface Booking {
	id: string
	reference: string
	venue: string
	customer: string
	customerEmail: string
	status: "confirmed" | "pending" | "cancelled"
	guests: number
	total: number
	date: string
}

/* One set of bookings for the whole page: the index and the engine under it show the same records. */
export const BOOKINGS: Booking[] = [
	{ id: "b1", reference: "BK-4417", venue: "Marlow Hall", customer: "Marla Okonkwo", customerEmail: "marla@example.com", status: "confirmed", guests: 120, total: 12400, date: "2026-10-14" },
	{ id: "b2", reference: "BK-4418", venue: "The Old Granary", customer: "Tom Adeyemi", customerEmail: "tom@example.com", status: "pending", guests: 45, total: 3200, date: "2026-10-18" },
	{ id: "b3", reference: "BK-4419", venue: "Riverside Rooms", customer: "Priya Raman", customerEmail: "priya@example.com", status: "confirmed", guests: 180, total: 22800, date: "2026-11-02" },
	{ id: "b4", reference: "BK-4420", venue: "Marlow Hall", customer: "Jonas Berg", customerEmail: "jonas@example.com", status: "cancelled", guests: 60, total: 0, date: "2026-11-09" },
	{ id: "b5", reference: "BK-4421", venue: "The Old Granary", customer: "Aiko Tanaka", customerEmail: "aiko@example.com", status: "confirmed", guests: 30, total: 2100, date: "2026-11-21" },
	{ id: "b6", reference: "BK-4422", venue: "Riverside Rooms", customer: "Leo Martins", customerEmail: "leo@example.com", status: "pending", guests: 210, total: 28900, date: "2026-12-05" },
]

export const STATUS = {
	confirmed: { label: "Confirmed", tone: "success" as const },
	pending: { label: "Pending", tone: "warning" as const },
	cancelled: { label: "Cancelled", tone: "destructive" as const },
}

export const TABS: FilterTab[] = [
	{ id: "all", label: "All", presets: [] },
	{ id: "confirmed", label: "Confirmed", presets: [{ key: "status", value: ["confirmed"] }] },
	{ id: "attention", label: "Needs attention", presets: [{ key: "status", value: ["pending", "cancelled"] }] },
]
