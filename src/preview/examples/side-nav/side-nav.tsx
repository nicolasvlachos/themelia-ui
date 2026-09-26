import { SideNav } from "themelia-ui/layout/navigation"

import { SETTINGS_NAV } from "./data"

export default function SideNavExample() {
	return (
		<div style={{ maxWidth: "16rem", width: "100%" }}>
			<SideNav groups={SETTINGS_NAV} currentPath="/settings/members" />
		</div>
	)
}
