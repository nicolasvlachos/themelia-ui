import {
	BuildingIcon, CalendarIcon, FileTextIcon, HashIcon, MapPinIcon, ReceiptIcon,
} from "lucide-react"

import type { GlobalSearchResult } from "themelia-ui/features/global-search"

import type { Group } from "./data"

const RESULTS: GlobalSearchResult<Group>[] = [
	{
		id: "p-1",
		group: "people",
		title: "Marlow Chen",
		subtitle: "Operations",
		avatar: { initials: "MC" },
		meta: [{ icon: <MapPinIcon />, label: "Sattersby" }],
		timestamp: "seen 2h ago",
	},
	{
		id: "p-2",
		group: "people",
		title: "Marla Okonkwo",
		subtitle: "Finance",
		avatar: { initials: "MO" },
		badge: { label: "Admin", tone: "neutral" },
	},
	{
		id: "b-1",
		group: "bookings",
		title: "Marlow Hall — autumn showcase",
		subtitle: "180 seated",
		thumbnail: { icon: <BuildingIcon /> },
		meta: [
			{ icon: <CalendarIcon />, label: "14 Oct" },
			{ icon: <HashIcon />, label: "BK-4417", mono: true },
		],
		badge: { label: "Confirmed", tone: "success" },
		rightValue: "€12,400",
		rightLabel: "Total",
	},
	{
		id: "b-2",
		group: "bookings",
		title: "Marlow Hall — rehearsal",
		thumbnail: { icon: <BuildingIcon />, tone: "neutral" },
		meta: [{ icon: <CalendarIcon />, label: "13 Oct" }],
		badge: { label: "Pending", tone: "warning" },
		rightValue: "€300",
		rightLabel: "Deposit",
	},
	{
		id: "i-1",
		group: "invoices",
		title: "INV-2291 — Marlow Hall",
		subtitle: "Issued 2 Sep",
		thumbnail: { icon: <ReceiptIcon /> },
		meta: [{ label: "Net 30" }],
		badge: { label: "Overdue", tone: "destructive" },
		rightValue: "€12,400",
		rightLabel: "Due",
	},
	{
		id: "f-1",
		group: "files",
		title: "marlow-floorplan.pdf",
		subtitle: "Uploaded by Alice",
		thumbnail: { icon: <FileTextIcon />, tone: "neutral" },
		tags: ["floorplan", "venue"],
		timestamp: "3 days ago",
	},
]

/** Stands in for the app's search endpoint. */
export function match(query: string): GlobalSearchResult<Group>[] {
	const needle = query.trim().toLowerCase()
	if (needle.length < 2) return []
	return RESULTS.filter((result) =>
		`${result.title} ${result.subtitle ?? ""}`.toLowerCase().includes(needle),
	)
}
