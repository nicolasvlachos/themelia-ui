/** What the record stores. */
export interface Venue {
	id: string
	name: string
	address: string
	capacity: number
	contact: string
}

/** What the picker offers — lighter, and a different shape on purpose. */
export interface VenueHit {
	id: string
	label: string
	description: string
}

export const VENUES: Record<string, Venue> = {
	"v-1": {
		id: "v-1",
		name: "Marlow Hall",
		address: "14 Bridge Street, Marlow",
		capacity: 180,
		contact: "bookings@marlowhall.example",
	},
	"v-2": {
		id: "v-2",
		name: "The Old Granary",
		address: "2 Mill Lane, Hexton",
		capacity: 60,
		contact: "hello@oldgranary.example",
	},
	"v-3": {
		id: "v-3",
		name: "Riverside Rooms",
		address: "8 Quay Road, Sattersby",
		capacity: 240,
		contact: "events@riverside.example",
	},
}

export const HITS: VenueHit[] = [
	{ id: "v-1", label: "Marlow Hall", description: "180 seated · main hall + bar" },
	{ id: "v-2", label: "The Old Granary", description: "60 seated · one room, no kitchen" },
	{ id: "v-3", label: "Riverside Rooms", description: "240 seated · three rooms" },
]
