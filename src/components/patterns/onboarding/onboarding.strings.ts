/** Copy owned by the onboarding blocks. Status labels name the step's glyph for screen readers. */
export interface ChecklistStrings {
	statusCompleted: string
	statusInProgress: string
	statusPending: string
	progressLabel: string
	/** "2 of 4 complete". */
	formatProgress: (completed: number, total: number) => string
}

export const defaultChecklistStrings: ChecklistStrings = {
	statusCompleted: "Completed",
	statusInProgress: "In progress",
	statusPending: "Not started",
	progressLabel: "Setup progress",
	formatProgress: (completed, total) => `${completed} of ${total} complete`,
}
