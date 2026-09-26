import { FileTextIcon, SettingsIcon, ShieldIcon, UsersIcon } from "lucide-react"

export const SETTINGS_NAV = [
	{
		id: "workspace",
		label: "Workspace",
		items: [
			{ label: "General", href: "/settings", icon: SettingsIcon },
			{ label: "Members", href: "/settings/members", icon: UsersIcon, badge: "12" },
			{ label: "Security", href: "/settings/security", icon: ShieldIcon },
		],
	},
	{
		id: "billing",
		label: "Billing",
		collapsible: true,
		items: [
			{ label: "Invoices", href: "/settings/invoices", icon: FileTextIcon },
			{ label: "Plan", href: "/settings/plan", disabled: true },
		],
	},
]
