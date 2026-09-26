import { RocketIcon, ShieldIcon } from "lucide-react"

import { SwitchCard, ToggleField } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"


export default function ToggleRows() {
	return (
		<Stack gap="lg" style={{ maxWidth: "34rem", width: "100%" }}>
			<SwitchCard
				label="Two-factor authentication"
				icon={ShieldIcon}
				description="Require a second factor when signing in from a new device."
				hint="Recovery codes are issued once, when you turn this on."
				defaultValue
				name="twofa"
			/>
			<SwitchCard
				label="Beta features"
				icon={RocketIcon}
				description="Turn on features that are still changing."
			/>
			<Stack gap="2xs">
				<ToggleField label="Email notifications" description="A daily digest, sent at 09:00." defaultValue />
				<ToggleField label="Product updates" description="Occasional release notes." />
				<ToggleField
					label="Usage reports"
					description="A checkbox instead of a switch, for a row that is a preference rather than a state."
					kind="checkbox"
					controlPosition="leading"
				/>
				<ToggleField label="Disabled" description="Not available on this plan." disabled />
			</Stack>
		</Stack>
	)
}
