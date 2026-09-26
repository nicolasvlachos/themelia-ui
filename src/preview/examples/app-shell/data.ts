import {
	ChartNoAxesColumnIcon, CreditCardIcon, FileTextIcon,
	SettingsIcon, UsersIcon,
} from "lucide-react"

import type { SidebarNavItem } from "themelia-ui/layout/sidebar"

/** Navigation data; with `currentUrl` it decides "active" once. */
export const NAVIGATION: Record<string, SidebarNavItem[]> = {
	Workspace: [
		{ label: "Overview", href: "/app", icon: ChartNoAxesColumnIcon },
		{ label: "Invoices", href: "/app/invoices", icon: FileTextIcon, handle: "invoices" },
		{ label: "Customers", href: "/app/customers", icon: UsersIcon },
		{ label: "Billing", href: "/app/billing", icon: CreditCardIcon },
	],
	Configure: [
		{
			label: "Settings",
			href: "/app/settings",
			icon: SettingsIcon,
			children: [
				{ label: "General", href: "/app/settings" },
				{ label: "Members", href: "/app/settings/members" },
			],
		},
		/* No href: this parent is a disclosure the reader opens, not a destination. */
		{
			label: "Reports",
			icon: ChartNoAxesColumnIcon,
			children: [
				{ label: "Revenue", href: "/app/reports/revenue" },
				{ label: "Tax", href: "/app/reports/tax" },
			],
		},
	],
}

export const PROVIDER = { persist: false, keyboardShortcut: false }
export const FRAME = {
	height: "34rem",
	borderRadius: "var(--radius)",
	border: "1px solid var(--border)",
	width: "100%",
	overflow: "hidden",
} as const
export const INVOICES = [
	{ id: "INV-4417", customer: "Northwind Traders", amount: "$1,299.50", paid: true },
	{ id: "INV-4418", customer: "Acme Corporation", amount: "$840.00", paid: false },
	{ id: "INV-4419", customer: "Initech", amount: "$2,150.00", paid: false },
]
