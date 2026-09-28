import { Fragment } from "react"

import { Stack } from "@/components/base/structure"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/base/table"
import { Text } from "@/components/base/typography"
import { themes, type ThemeName } from "@/lib/theming"

import { Callout } from "../partials/callout"
import { CodeBlock } from "../partials/code-block"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"

const NAMES = Object.keys(themes) as ThemeName[]

/** A radius as whole pixels at the default root size: "1.5rem" reads as 24. */
const px = (length = "0px") => Math.round(Number.parseFloat(length) * (length.endsWith("rem") ? 16 : 1))

/** What each theme sets, read from the themes themselves. */
const SETTINGS: { label: string; key: string; value: (name: ThemeName) => string }[] = [
	{
		label: "Corners",
		key: "theme.radius, radiusSm",
		value: (name) => `${px(themes[name].config.theme?.radius ?? "1rem")} / ${px(themes[name].config.theme?.radiusSm ?? "0.5rem")}px`,
	},
	{ label: "Spacing", key: "density", value: (name) => themes[name].config.density ?? "default" },
	{ label: "Cards", key: "defaults.card.surface", value: (name) => themes[name].config.defaults?.card?.surface ?? "framed" },
	{
		label: "Shadows",
		key: "theme.vars.shadow",
		value: (name) => {
			const shadow = themes[name].config.theme?.vars?.shadow
			return shadow === "0 0 transparent" ? "none" : shadow ? "its own" : "the kit's"
		},
	},
	{
		label: "Headings",
		key: "typography.fonts.heading",
		value: (name) => (themes[name].config.typography?.fonts?.heading ? "serif" : "the body face"),
	},
	{ label: "Type", key: "typography.scale", value: (name) => `×${themes[name].config.typography?.scale ?? 1}` },
	{ label: "Motion", key: "motion.durations.normal", value: (name) => themes[name].config.motion?.durations?.normal ?? "200ms" },
]

const OWN_THEME = `
import { themes, type ThemePreset } from "themelia-ui/theming"

export const brand: ThemePreset = {
  label: "Brand",
  description: "Our product's look.",
  config: {
    ...themes.sharp.config,
    density: "comfortable",
    typography: { fonts: { heading: "'Iowan Old Style', Georgia, serif" } },
    defaults: { card: { surface: "card" }, button: { appearance: "solid" } },
    theme: {
      radius: "0.5rem",
      radiusSm: "0.25rem",
      colors: {
        ...themes.sharp.config.theme?.colors,
        primary: "light-dark(oklch(0.5 0.19 15), oklch(0.76 0.13 15))",
        "primary-foreground": "light-dark(oklch(0.985 0 0), oklch(0.2 0.05 15))",
      },
      // No shadow is a transparent one: \`none\` cannot join the hairline a popup lists it after.
      vars: { shadow: "0 0 transparent", "shadow-lg": "0 0 transparent" },
    },
  },
}

// The whole app, popups included:
<UIProvider config={brand.config}>
  <UIPortalHost>
    <App />
  </UIPortalHost>
</UIProvider>
`

export function ThemesPage() {
	return (
		<ComponentPage>
			<Example
				example="themes/gallery"
				title="Four styles"
				description="Each theme is a style, not a colour: a label, a line on what it is for, and a provider config that sets colours, corners, shadows, spacing, type, motion and how components draw themselves. Here each one themes its own region; the header's Theme menu applies one to this whole site."
			/>

			<Example
				example="themes/switch-themes"
				title="Switching themes"
				description="Switching is handing the provider another theme's config; the region repaints in place. Brand is a theme of its own: Sharp with a rose accent and more room."
			/>

			<Example id="theme-settings" title="What each theme sets">
				<Stack gap="sm">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Setting</TableHead>
								{NAMES.map((name) => (
									<TableHead key={name}>{themes[name].label}</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{SETTINGS.map((setting) => (
								<TableRow key={setting.label}>
									<TableCell wrap>
										<Stack gap="none">
											<Text tag="span" weight="medium">{setting.label}</Text>
											<Text tag="span" size="xs" type="secondary" mono>
												{/* A break after each dot, so a long path wraps rather than widening the table. */}
												{setting.key.split(".").map((part, index) => (
													<Fragment key={part}>
														{index > 0 && <>.<wbr /></>}
														{part}
													</Fragment>
												))}
											</Text>
										</Stack>
									</TableCell>
									{NAMES.map((name) => (
										<TableCell key={name}>{setting.value(name)}</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Text type="secondary">
						A square theme sets its cards to <code>card</code>, one hairline: the <code>framed</code> surface is
						a band that follows the corner, and with no corner to follow it reads as a box in a box.
					</Text>
				</Stack>
			</Example>

			<Example id="own-theme" title="Make your own">
				<Stack gap="sm">
					<Text type="secondary">
						A theme of your own is the same shape. Start from one of these and change what you need, or
						open the theme editor (the palette button) from any of them and export the result.
					</Text>
					<CodeBlock code={OWN_THEME} />
					<Callout label="Rule">
						Keep every colour a <code>light-dark()</code> pair that holds 4.5:1 for text. The four shipped
						themes are measured in both modes by the same contrast test as the kit's own.
					</Callout>
				</Stack>
			</Example>
		</ComponentPage>
	)
}
