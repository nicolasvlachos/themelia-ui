import type { SemanticTone } from "./component-vocabulary"

/** The button treatments an action may take. */
export const ACTION_APPEARANCES = ["solid", "outline", "ghost", "link"] as const

export type ActionAppearance = (typeof ACTION_APPEARANCES)[number]

/**
 * The presentation an action carries wherever it is rendered (ActionMenu, ActionButtons,
 * page header, table row, command palette), so one definition looks the same everywhere.
 */
export interface ActionPresentation {
	/** Semantic colour intent. Colour is always `tone`, never `variant`. */
	tone?: SemanticTone
	/** Button treatment, independent of the colour. */
	appearance?: ActionAppearance
	/** Set false to omit the action entirely. */
	visible?: boolean
	/** Prevents activation while keeping the action visible. */
	disabled?: boolean
}
