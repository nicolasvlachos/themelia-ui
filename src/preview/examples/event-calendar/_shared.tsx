import { UtensilsIcon, WrenchIcon } from "lucide-react"

import type { EventCategory } from "themelia-ui/features/event-calendar"

export const CATEGORIES: EventCategory[] = [
	{ id: "events", label: "Events", colorToken: "info", icon: <UtensilsIcon /> },
	{ id: "maintenance", label: "Maintenance", colorToken: "warning", icon: <WrenchIcon /> },
	{ id: "closed", label: "Closed", colorToken: "destructive" },
]
