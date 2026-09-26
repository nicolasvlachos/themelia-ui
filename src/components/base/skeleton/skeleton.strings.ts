/** What a skeleton announces while there is nothing to read. `label` overrides per instance. */
export interface SkeletonStrings {
	/** A region of content. */
	loading: string
	/** A whole page's worth. */
	loadingPage: string
	/** A table, where the shape being loaded is worth naming. */
	loadingTable: string
}

export const defaultSkeletonStrings: SkeletonStrings = {
	loading: "Loading",
	loadingPage: "Loading page",
	loadingTable: "Loading table",
}
