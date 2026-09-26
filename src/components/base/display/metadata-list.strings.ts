export interface MetadataListStrings {
	/** The info trigger's accessible name, built from the label — a function because word order varies by language. */
	formatInfoLabel: (label: string) => string
	/** Used when the field's label is a node rather than a string. */
	infoFallback: string
}

export const defaultMetadataListStrings: MetadataListStrings = {
	formatInfoLabel: (label) => `${label} info`,
	infoFallback: "Info",
}
