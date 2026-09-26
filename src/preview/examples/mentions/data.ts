import { CalendarIcon, TicketIcon, UserIcon } from "lucide-react"

import type { Mention, MentionResource } from "themelia-ui/features/mentions"

export type Kind = "user" | "booking" | "incident"

export const RESOURCES: Partial<Record<Kind, MentionResource<Kind>>> = {
	user: {
		label: "Person",
		trigger: "@",
		icon: UserIcon,
		tone: "info",
		suggestions: [
			{ id: "1", label: "Maria Petrova", description: "Operations · Athens" },
			{ id: "2", label: "Marcus Webb", description: "Finance · London" },
			{ id: "3", label: "Alice Mercer", description: "Support · Dublin" },
		],
		buildHref: (suggestion) => `#/mentions?user=${suggestion.id}`,
	},
	booking: {
		label: "Booking",
		trigger: "#",
		icon: CalendarIcon,
		tone: "success",
		suggestions: [
			{ id: "4417", label: "Marlow Hall — 14 Aug", description: "Confirmed · 4 guests" },
			{ id: "4418", label: "Northwind Suite — 21 Aug", description: "Pending deposit" },
		],
	},
	incident: {
		label: "Incident",
		trigger: "!",
		icon: TicketIcon,
		tone: "destructive",
		suggestions: [
			{ id: "77", label: "Payment gateway timeout", description: "Open · P2" },
		],
	},
}

export const STORED_MENTIONS: Mention<Kind>[] = [
	{ id: "user:1", kind: "user", label: "Maria Petrova", href: "#/mentions?user=1" },
	{ id: "booking:4417", kind: "booking", label: "Marlow Hall — 14 Aug" },
	{ id: "incident:77", kind: "incident", label: "Payment gateway timeout" },
]
