/** Copy owned by the admin blocks. Counts are functions, so a translation controls pluralisation. */
export interface CredentialListStrings {
	title: string
	addLabel: string
	rowMenuLabel: string
	copyLabel: string
	deleteLabel: string
	emptyMessage: string
}

export const defaultCredentialListStrings: CredentialListStrings = {
	title: "API keys",
	addLabel: "Add key",
	rowMenuLabel: "Key actions",
	copyLabel: "Copy key",
	deleteLabel: "Delete",
	emptyMessage: "No keys yet.",
}

export interface RolePermissionsStrings {
	editLabel: string
	formatMemberCount: (count: number) => string
	/** Announces a granted permission; the glyph beside it is decorative. */
	granted: string
	notGranted: string
}

export const defaultRolePermissionsStrings: RolePermissionsStrings = {
	editLabel: "Edit role",
	formatMemberCount: (count) => `${count} members`,
	granted: "Granted",
	notGranted: "Not granted",
}
