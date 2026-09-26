export interface BatchActionBarStrings {
	/** The selection summary ("3 of 250 selected"), a function because sentence shape varies by language. */
	summary: (selected: number, total?: number) => string
	/** The control that drops the selection. */
	clear: string
	/** Names the bar for assistive technology. */
	label: string
}

export const defaultBatchActionBarStrings: BatchActionBarStrings = {
	summary: (selected, total) =>
		total === undefined ? `${selected} selected` : `${selected} of ${total} selected`,
	clear: "Clear",
	label: "Batch actions",
}
