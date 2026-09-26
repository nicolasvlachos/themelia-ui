import { useState } from "react"
import { MonitorIcon, MoonIcon, PaletteIcon, SunIcon, XIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { PillRadioGroup } from "@/components/base/choice-inputs"
import { FormField } from "@/components/base/forms"
import { Popover, PopoverContent, PopoverFooter, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/base/popover"
import { Grid, Stack } from "@/components/base/structure"
import { NativeSelect } from "@/components/base/text-inputs"
import { Heading, Text } from "@/components/base/typography"
import { ScrollArea } from "@/components/base/display"
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/navigation"
import { ColorInput } from "@/components/base/value-inputs"
import { deriveThemePalette } from "@/lib/theming"
import type { ColorScheme, Density } from "@/lib/ui-provider"

import { useAppTheme } from "../app-theme-state"
import styles from "../preview.module.css"
import { AppThemeEditor } from "./app-theme-editor"

/* Corner presets either side of the default (1rem over 0.5rem), inner corner at half the outer. */
const CORNER_PRESETS = [
	{ label: "Square", radius: "0rem", radiusSm: "0rem" },
	{ label: "Soft", radius: "0.5rem", radiusSm: "0.25rem" },
	{ label: "Round", radius: "1.25rem", radiusSm: "0.625rem" },
] as const

/** App functionality: a persistent launcher, independent of the route being viewed. */
export function AppThemeLauncher() {
	const { theme, appliedConfig, updateConfig, updateTheme, reset, open, setOpen } = useAppTheme()
	const [advanced, setAdvanced] = useState(false)
	const [colorError, setColorError] = useState(false)
	const [accentDraft, setAccentDraft] = useState<string | null>(null)

	function shared(name: `--${string}`, value: string) {
		const next = { ...theme.shared }
		if (value) next[name] = value
		else delete next[name]
		updateTheme({ ...theme, shared: next })
	}

	/* A corner preset is the PAIR: the container radius and the inner one move together. */
	function corners(preset: string) {
		const next = { ...theme.shared }
		delete next["--radius"]
		delete next["--radius-sm"]
		const pair = CORNER_PRESETS.find((p) => p.radius === preset)
		if (pair) Object.assign(next, { "--radius": pair.radius, "--radius-sm": pair.radiusSm })
		updateTheme({ ...theme, shared: next })
	}

	function accent(value: string) {
		setAccentDraft(value)
		if (!CSS.supports("color", value)) { setColorError(true); return }
		try {
			const light = deriveThemePalette({ primary: value, mode: "light" })
			const dark = deriveThemePalette({ primary: value, mode: "dark" })
			updateTheme({ ...theme, light: { ...theme.light, ...light }, dark: { ...theme.dark, ...dark } })
			setColorError(false)
		} catch { setColorError(true) }
	}

	function resetApp() {
		reset()
		setAccentDraft(null)
		setColorError(false)
	}

	return (
		<Popover open={open} onOpenChange={next => {
			setOpen(next)
			if (!next) { setAdvanced(false); setAccentDraft(null); setColorError(false) }
		}}>
			<PopoverTrigger render={<Button iconOnly tone="neutral" buttonStyle="outline" className={styles.themeLauncher} />} aria-label="Customize theme" title="Customize theme" data-app-theme-launcher>
				<PaletteIcon />
			</PopoverTrigger>
			<PopoverContent side="top" align="end" sideOffset={12} width="min(26rem, 90vw)" inset="flush" className={styles.themePanel}>
				<PopoverHeader className={styles.themePanelHeader}>
					<Stack direction="horizontal" align="center" justify="between" gap="sm" wrap={false}>
						<PopoverTitle render={<Heading level={2} size="base" />}>Theme settings</PopoverTitle>
						<Button iconOnly tone="neutral" buttonStyle="ghost" aria-label="Close theme settings" onClick={() => { setOpen(false); setAdvanced(false); setAccentDraft(null); setColorError(false) }}><XIcon /></Button>
					</Stack>
				</PopoverHeader>
				<Tabs value={advanced ? "advanced" : "appearance"} onValueChange={value => { setAdvanced(value === "advanced"); setAccentDraft(null); setColorError(false) }} className={styles.themePanelTabs}>
					<TabList variant="enclosed" label="Theme editor view" className={styles.themePanelNavigation}>
						<Tab value="appearance">Appearance</Tab>
						<Tab value="advanced">All theme values</Tab>
					</TabList>
					<ScrollArea key={advanced ? "advanced" : "appearance"} className={styles.themePanelBody} aria-label={advanced ? "Theme variables" : "Appearance settings"}>
						<TabPanel value="appearance" className={styles.themePanelView}>
							<Stack gap="lg">
								<FormField label="Color scheme" htmlFor={false}>
									<PillRadioGroup fullWidth value={appliedConfig.colorScheme ?? "system"} onValueChange={value => updateConfig({ ...appliedConfig, colorScheme: value as ColorScheme })} options={[
										{ value: "light", label: "Light", icon: <SunIcon /> },
										{ value: "dark", label: "Dark", icon: <MoonIcon /> },
										{ value: "system", label: "Auto", icon: <MonitorIcon /> },
									]} />
								</FormField>
								<FormField label="Accent color" error={colorError ? "Enter a valid color." : undefined}>
									<ColorInput value={accentDraft ?? theme[theme.mode]["--primary"] ?? ""} previewValue="var(--primary)" placeholder="Current accent" onValueChange={accent} />
								</FormField>
								<Grid columns={2} gap="md">
									<FormField label="Density">
										<NativeSelect value={appliedConfig.density ?? "default"} onChange={event => updateConfig({ ...appliedConfig, density: event.target.value as Density })}>
											<option value="compact">Compact</option><option value="default">Default</option><option value="comfortable">Comfortable</option>
										</NativeSelect>
									</FormField>
									<FormField label="Corners">
										<NativeSelect value={theme.shared["--radius"] ?? ""} onChange={event => corners(event.target.value)}>
											<option value="">Default</option>
											{CORNER_PRESETS.map((p) => <option key={p.radius} value={p.radius}>{p.label}</option>)}
											{theme.shared["--radius"] && !CORNER_PRESETS.some((p) => p.radius === theme.shared["--radius"]) && <option value={theme.shared["--radius"]}>Custom</option>}
										</NativeSelect>
									</FormField>
								</Grid>
								<FormField label="Font">
									<NativeSelect value={theme.shared["--font-sans"] ?? ""} onChange={event => shared("--font-sans", event.target.value)}>
										<option value="">App default</option><option value="system-ui, sans-serif">System sans</option><option value="Georgia, serif">Serif</option><option value="ui-monospace, monospace">Monospace</option>
										{theme.shared["--font-sans"] && !["system-ui, sans-serif", "Georgia, serif", "ui-monospace, monospace"].includes(theme.shared["--font-sans"]) && <option value={theme.shared["--font-sans"]}>Custom</option>}
									</NativeSelect>
								</FormField>
							</Stack>
						</TabPanel>
						<TabPanel value="advanced" className={styles.themePanelView}><AppThemeEditor /></TabPanel>
					</ScrollArea>
				</Tabs>
				<PopoverFooter className={styles.themePanelFooter}>
					<Text size="xs" type="secondary">Saved in this browser</Text>
					<Button tone="neutral" buttonStyle="ghost" onClick={resetApp}>Reset</Button>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	)
}
