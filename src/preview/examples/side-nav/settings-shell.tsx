import { Card } from "themelia-ui/base/cards"
import { Text } from "themelia-ui/base/typography"
import { SideNav } from "themelia-ui/layout/navigation"
import { AsideNavShell } from "themelia-ui/layout/settings"

import { SETTINGS_NAV } from "./data"

export default function SettingsShell() {
	return (
		<>
			{/* Its own landmark name, distinct from the SideNav demo above. */}
			<AsideNavShell
				title="Settings"
				description="Everything about this workspace."
				aside={<SideNav groups={SETTINGS_NAV} currentPath="/settings/members" strings={{ label: "Settings" }} />}
				stickyAside={false}
				style={{ width: "100%" }}
			>
				<Card surface="bordered" title="Members" description="Who can sign in and what they can do.">
					<Text size="sm" type="secondary">The section's content sits here.</Text>
				</Card>
			</AsideNavShell>
		</>
	)
}
