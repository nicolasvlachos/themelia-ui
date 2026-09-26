import { RocketIcon, ShieldIcon } from "lucide-react"

import { Switch, SwitchCard, ToggleField } from "@/components/base/choice-inputs"
import { Stack } from "@/components/base/structure"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SwitchPage() {
	return (
		<ComponentPage
			title="Switch & toggle field"
			summary="An immediate on/off state — it takes effect when flipped, with no save step — on its own, as a settings row (ToggleField), and as a feature card (SwitchCard). The row and the card are one component at two weights."
			importPath="@/components/base/choice-inputs"
			exports={["Switch", "ToggleField", "SwitchCard"]}
		>
			<Example
				id="switch"
				title="Switch"
				description="Use it for something that applies the moment it moves. A switch that needs a Save button beside it is telling the reader the wrong thing — that is a checkbox in a form."
				stacked
				code={`<Switch label="Email notifications" defaultChecked />`}
			>
				<Stack gap="sm">
					<Switch label="Email notifications" defaultChecked />
					<Switch label="Disabled" disabled />
				</Stack>
			</Example>

			<Example
				id="toggle-rows"
				title="Settings rows and feature cards"
				description="The same toggle at two weights. A SwitchCard is the top-of-list feature switch; a ToggleField is the settings row underneath it. Both make the whole row the target, and SwitchCard is ToggleField with surface=&quot;card&quot;."
				stacked
				code={`<SwitchCard label="Two-factor authentication" icon={ShieldIcon} description="…" />
<ToggleField label="Email notifications" description="…" />
<ToggleField surface="card" kind="checkbox" label="Usage reports" />`}
			>
				<Stack gap="lg" style={MEASURE.wide}>
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
			</Example>

			<Example id="switch-api" title="Switch API">
				<PropTable owner="Switch"
					rows={[
						{ name: "label", type: "ReactNode", description: "Rendered beside the track and wired to it." },
						{ name: "checked / defaultChecked", type: "boolean", description: "Controlled and uncontrolled state." },
						{ name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Receives the native change event. Read event.target.checked for the next state." },
					]}
				/>
			</Example>

			<Example id="toggle-field-api" title="ToggleField and SwitchCard API">
				<PropTable owner="ToggleField"
					rows={[
						{ name: "label / description / hint", type: "ReactNode", description: "The row's label, its supporting sentence, and quieter guidance under that." },
						{ name: "kind", type: '"switch" | "checkbox"', default: '"switch"', description: "A checkbox for a preference that is saved with the form; a switch for state that applies immediately." },
						{ name: "surface", type: '"row" | "card"', default: '"row"', description: "A plain settings row, or the bordered feature card that takes the checked colour. SwitchCard presets \"card\"." },
						{ name: "icon", type: "LucideIcon | ReactNode", description: "A leading glyph in a medallion. At home on the card surface." },
						{ name: "controlPosition", type: '"leading" | "trailing"', default: '"trailing"', description: "Which side the control sits on." },
						{ name: "value / defaultValue / onValueChange", type: "boolean", description: "Controlled and uncontrolled state." },
						{ name: "uncheckedValue", type: "string", description: "What submits when off. Unset, an unchecked control submits nothing — the platform's rule. SwitchCard sets \"0\" (and \"1\" when on)." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
