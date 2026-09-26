import { useState } from "react"

import { ListRadioGroup } from "themelia-ui/base/choice-inputs"


const ROLES = [
	{ value: "owner", label: "Owner", description: "Full access, including billing and deletion." },
	{ value: "admin", label: "Admin", description: "Manages members and settings.", tooltip: "Cannot delete the workspace or change the billing plan." },
	{ value: "member", label: "Member", description: "Reads and writes project data." },
	{ value: "viewer", label: "Viewer", description: "Read-only.", disabled: true },
]

export default function ListRadio() {
	const [role, setRole] = useState("admin")

	return (
		<div style={{ maxWidth: "34rem", width: "100%" }}>
			<ListRadioGroup options={ROLES} value={role} onValueChange={setRole} />
		</div>
	)
}
