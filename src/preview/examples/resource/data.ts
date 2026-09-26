import type { MetadataListItem } from "themelia-ui/base/display"

export const DETAILS: MetadataListItem[] = [
	{ label: "Reference", value: { kind: "mono", value: "INV-4417" } },
	{ label: "Amount", value: { kind: "money", value: 48_200, currency: "USD" } },
	{ label: "Issued", value: { kind: "date", value: "2026-08-14" } },
	{ label: "Due", value: { kind: "date", value: "2026-08-28" } },
	{ label: "Billing email", value: { kind: "email", value: "billing@northwind.test" } },
	{ label: "Paid", value: null },
]
