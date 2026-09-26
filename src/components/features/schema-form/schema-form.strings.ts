export interface SchemaFormStrings {
	submitLabel: string
	resetLabel: string
	/** Shown when submission rejects; values remain available for retry. */
	submitError?: string
	/** Names the bucket that holds fields no section claimed. */
	defaultSectionTitle: string
	emptyTitle: string
	emptyDescription: string
	jsonParseError: string
	/** Shown when a consumer's own validator throws rather than returning a message. */
	validationError: string
	requiredError: (label: string) => string
}

export const defaultSchemaFormStrings: SchemaFormStrings = {
	submitLabel: "Save changes",
	resetLabel: "Reset",
	submitError: "Changes could not be saved. Please try again.",
	defaultSectionTitle: "General",
	emptyTitle: "No fields configured",
	emptyDescription: "Add fields to the schema to render a form.",
	jsonParseError: "Enter valid JSON.",
	validationError: "Invalid value.",
	requiredError: (label) => `${label} is required.`,
}
