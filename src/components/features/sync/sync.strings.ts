export interface SyncRangeFormStrings {
	hoursLabel: string
	hoursDescription: string
	optionsLabel: string
	optionsDescription: string
	/** Shown when no window is chosen and the form is submitted. */
	hoursRequired: string
}

export const defaultSyncRangeFormStrings: SyncRangeFormStrings = {
	hoursLabel: "Sync window",
	hoursDescription: "How far back the integration should reconcile records.",
	optionsLabel: "Options",
	optionsDescription: "Narrow the run when only one record family needs repairing.",
	hoursRequired: "Choose a sync window.",
}
