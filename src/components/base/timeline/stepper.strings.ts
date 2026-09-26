/** The stepper's copy — all for screen readers, since the markers are decoration. */
export interface StepperStrings {
	/** Says what the marker's numeral counts — "Step 2 of 4". */
	position: (index: number, total: number) => string
	/** Said with a finished step, so the tick and its tone are not the only sign of it. */
	completed: string
	/** Said with the step the reader is on, alongside `aria-current`. */
	current: string
}

export const defaultStepperStrings: StepperStrings = {
	position: (index, total) => `Step ${index} of ${total}`,
	completed: "Completed",
	current: "Current step",
}
