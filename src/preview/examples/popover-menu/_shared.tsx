import { UserIcon } from "lucide-react"

import type { PopoverMenuItem } from "themelia-ui/base/popover-menu"

export const OWNERS: PopoverMenuItem[] = [
	{ value: "jane", label: "Jane McDonald", description: "jane@northwind.example", icon: <UserIcon /> },
	{ value: "raj", label: "Raj Patel", description: "raj@northwind.example", icon: <UserIcon /> },
	{ value: "mei", label: "Mei Chen", description: "mei@northwind.example", icon: <UserIcon /> },
	{ value: "sam", label: "Sam Okafor", description: "sam@northwind.example", icon: <UserIcon />, disabled: true },
]
