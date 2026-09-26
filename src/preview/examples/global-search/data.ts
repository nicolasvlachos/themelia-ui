import type { GlobalSearchIdleSection } from "themelia-ui/features/global-search"

export type Group = "people" | "bookings" | "invoices" | "files"

export const GROUP_LABELS: Record<Group, string> = {
	people: "People",
	bookings: "Bookings",
	invoices: "Invoices",
	files: "Files",
}

export const IDLE: GlobalSearchIdleSection[] = [
	{
		id: "recent",
		label: "Recent",
		items: [
			{ id: "r-1", label: "overdue invoices" },
			{ id: "r-2", label: "Marlow Hall" },
		],
	},
	{
		id: "suggestions",
		label: "Suggestions",
		items: [
			{ id: "s-1", label: "Bookings this week" },
			{ id: "s-2", label: "Unassigned venues" },
		],
	},
]
