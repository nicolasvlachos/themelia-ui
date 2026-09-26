export interface WorkspaceNavStrings {
	/** Names the region. */
	label: string
	/** Announced beside the current entry, which is otherwise only tinted. */
	current: string
	completion: (percent: number) => string
}

export const defaultWorkspaceNavStrings: WorkspaceNavStrings = {
	label: "Workspace navigation",
	current: "Current",
	completion: (percent) => `${percent}% complete`,
}

export interface WorkspaceLocaleStripStrings {
	label: string
	active: string
	completion: (percent: number) => string
}

export const defaultWorkspaceLocaleStripStrings: WorkspaceLocaleStripStrings = {
	label: "Workspace locales",
	active: "Active",
	completion: (percent) => `${percent}% complete`,
}

export interface WorkspaceRecordHeaderStrings {
	/** Names the metadata list, which is a definition list with no visible caption. */
	metadata: string
	/** Names the actions region. */
	actions: string
}

export const defaultWorkspaceRecordHeaderStrings: WorkspaceRecordHeaderStrings = {
	metadata: "Record metadata",
	actions: "Record actions",
}
