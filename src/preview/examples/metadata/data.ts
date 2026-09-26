import { BuildingIcon, CalendarIcon, CreditCardIcon, HashIcon, MailIcon } from "lucide-react"

import type { MetadataListItem } from "themelia-ui/base/display"

export const FACTS: MetadataListItem[] = [
	{ label: "Reference", value: { kind: "mono", value: "INV-4417" }, icon: HashIcon },
	{ label: "Customer", value: "Northwind Traders", icon: BuildingIcon },
	{ label: "Billing email", value: { kind: "email", value: "billing@northwind.test" }, icon: MailIcon },
	{
		label: "Amount",
		value: { kind: "money", value: 48_200, currency: "USD" },
		icon: CreditCardIcon,
		tooltip: "Excludes tax and any credit applied at settlement.",
	},
	{ label: "Issued", value: { kind: "date", value: "2026-08-14" }, icon: CalendarIcon },
	{ label: "Paid", value: null, description: "Nothing has been received against this invoice." },
	{ label: "Status", value: { kind: "badge", value: "Overdue", badgeTone: "destructive" } },
	{ label: "Portal", value: { kind: "link", href: "https://example.test/inv/4417", value: "View in portal" } },
]
