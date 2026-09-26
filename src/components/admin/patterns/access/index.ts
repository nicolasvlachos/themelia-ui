/**
 * Admin blocks for a settings area. None fetches, navigates or confirms a destructive
 * action: callbacks and slots keep those at the call site.
 */
export {
	CredentialList,
	type CredentialListProps, type Credential,
} from "./credential-list"
export {
	RolePermissions,
	type RolePermissionsProps, type Permission, type PermissionGroup,
} from "./role-permissions"
export { SensitiveAction, type SensitiveActionProps } from "./sensitive-action"
export {
	defaultCredentialListStrings, defaultRolePermissionsStrings,
	type CredentialListStrings, type RolePermissionsStrings,
} from "./admin.strings"
