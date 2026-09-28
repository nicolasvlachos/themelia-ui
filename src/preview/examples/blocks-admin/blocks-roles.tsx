import { RolePermissions } from "themelia-ui/blocks/admin/access"

const GROUPS = [
	{
		name: "Members",
		permissions: [
			{ label: "View", granted: true },
			{ label: "Invite", granted: true },
			{ label: "Remove", granted: false },
		],
	},
	{
		name: "Billing",
		permissions: [
			{ label: "View invoices", granted: true },
			{ label: "Change plan", granted: false },
			{ label: "Update card", granted: false },
		],
	},
]

export default function BlocksRoles() {
	return (
		<RolePermissions
			roleName="Editor"
			description="Can publish and manage content, but not billing."
			memberCount={12}
			groups={GROUPS}
			onEdit={() => {}}
		/>
	)
}
