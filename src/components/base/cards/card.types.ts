import type { ActionDefinition } from "@/components/base/action-menu"
import type { AlertTone } from "@/components/base/feedback"

/** Outer chrome. `flat` is a card in structure only, for a region that must not look like a panel. */
export type CardSurface = "card" | "framed" | "flat" | "bordered"

export type CardAlertTone = AlertTone

/* Overflow commands are ordinary action definitions, rendered by the shared ActionMenu. */
export type CardAction = ActionDefinition

declare module "@/lib/ui-provider" {
	interface ComponentDefaults {
		card: {
			surface: CardSurface
			headerDivider: boolean
		}
	}
}
