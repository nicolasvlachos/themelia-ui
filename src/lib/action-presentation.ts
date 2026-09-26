import type { SemanticTone } from "./component-vocabulary"

/** The button treatments an action may take. */
export const ACTION_BUTTON_STYLES = ["solid", "outline", "ghost", "link"] as const

export type ActionButtonStyle = (typeof ACTION_BUTTON_STYLES)[number]

/**
 * The presentation an action carries wherever it is rendered (ActionMenu, ActionButtons,
 * page header, table row, command palette), so one definition looks the same everywhere.
 */
export interface ActionPresentation {
	/** Semantic colour intent. `tone`, never `variant` — see docs/maintainers/guidelines.md. */
	tone?: SemanticTone
	/** Button treatment, independent of the colour. */
	buttonStyle?: ActionButtonStyle
	/** Set false to omit the action entirely. */
	visible?: boolean
	/** Prevents activation while keeping the action visible. */
	disabled?: boolean
}
