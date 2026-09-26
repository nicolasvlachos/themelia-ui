export interface ActionMenuStrings {
	/** Accessible name for an icon-only trigger, which has no visible text of its own. */
	trigger: string
	/** Accessible name for the trigger holding the actions that did not fit as buttons. */
	overflow: string
}

export const defaultActionMenuStrings: ActionMenuStrings = {
	trigger: "More actions",
	overflow: "More actions",
}
