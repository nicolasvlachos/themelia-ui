import type { CalendarEvent } from "themelia-ui/features/event-calendar"

/* A fixed month, so the examples look the same every day they are opened. */
export const MONTH = new Date(2026, 8, 1)
const on = (day: number, hour = 9) => new Date(2026, 8, day, hour, 0)

export const EVENTS: CalendarEvent[] = [
	{
		id: "e1", title: "Okonkwo wedding", category: "events", startDate: on(5, 14),
		metadata: { customerName: "Marla Okonkwo", guestCount: 120, serviceName: "Main hall + bar", cellTitle: "Okonkwo" },
	},
	{ id: "e2", title: "Corporate away day", category: "events", startDate: on(5, 9), metadata: { guestCount: 40 } },
	{ id: "e3", title: "Autumn showcase", category: "events", startDate: on(12, 19), metadata: { customerName: "Riverside Rooms", guestCount: 180 } },
	{ id: "e4", title: "Rehearsal", category: "events", startDate: on(11, 18) },
	{ id: "e5", title: "Floor resurfacing", category: "maintenance", startDate: on(15), endDate: new Date(2026, 8, 17), allDay: true },
	{ id: "e6", title: "Boiler service", category: "maintenance", startDate: on(23, 8) },
	{ id: "e7", title: "Bank holiday", category: "closed", startDate: on(28), allDay: true },
	{ id: "e8", title: "Marlow anniversary", category: "events", startDate: on(5, 20) },
	{ id: "e9", title: "Deep clean", category: "maintenance", startDate: on(5, 7) },
]
