import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { PillRadioGroup } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { themes, type ThemePreset } from "themelia-ui/theming"
import { UIProvider } from "themelia-ui/ui-provider"

/* A theme of your own: start from one and change what you need. Here, Sharp with a rose accent and more room. */
const brand: ThemePreset = {
	label: "Brand",
	description: "Sharp's square corners, a rose accent and room to breathe.",
	config: {
		...themes.sharp.config,
		density: "comfortable",
		theme: {
			...themes.sharp.config.theme,
			colors: {
				...themes.sharp.config.theme?.colors,
				primary: "light-dark(oklch(0.5 0.19 15), oklch(0.76 0.13 15))",
				"primary-foreground": "light-dark(oklch(0.985 0 0), oklch(0.2 0.05 15))",
				ring: "light-dark(oklch(0.56 0.17 15), oklch(0.7 0.12 15))",
			},
		},
	},
}

const CHOICES: Record<string, ThemePreset | undefined> = { default: undefined, ...themes, brand }

/* Switching a theme is switching which config the provider is handed: the region repaints in place. */
export default function SwitchThemes() {
	const [choice, setChoice] = useState("soft")

	return (
		<Stack style={{ width: "100%", maxWidth: "38rem" }}>
			<PillRadioGroup
				aria-label="Theme for this example"
				name="switch-theme"
				value={choice}
				onValueChange={(value) => { if (value) setChoice(value) }}
				options={Object.entries(CHOICES).map(([value, theme]) => ({ value, label: theme?.label ?? "Default" }))}
			/>
			<UIProvider config={CHOICES[choice]?.config ?? {}}>
				<Card title="Invite your team" description="Teammates see the same projects and saved views.">
					<Stack gap="sm">
						<Input aria-label="Email address" placeholder="name@example.com" />
						<Stack direction="horizontal" gap="sm">
							<Button>Send invite</Button>
							<Button tone="neutral" appearance="ghost">Copy link</Button>
						</Stack>
					</Stack>
				</Card>
			</UIProvider>
		</Stack>
	)
}
