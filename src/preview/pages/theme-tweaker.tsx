import { Text } from "@/components/base/typography"
import { Stack } from "@/components/base/structure"
import { Money } from "@/components/primitives"
import { Accordion } from "@/components/base/accordion"
import { Button } from "@/components/base/buttons"
import { ThemeScope, createTheme } from "@/components/features/theme-tweaker"

import { ComponentPage } from "../partials/component-page"
import { AppThemeEditor } from "../partials/app-theme-editor"
import { PropTable } from "../partials/prop-table"
import { CodeBlock } from "../partials/code-block"
import { Example } from "../partials/example"

export function ThemeTweakerPage() {
	return (
		<ComponentPage
			title="Theme tweaker"
			summary="Edit this app's theme live. Colors, typography, spacing, and provider settings apply throughout the app, including menus and dialogs."
			exports={["ThemeTweaker", "ThemeScope", "UIConfigSettings", "useAppliedTheme"]}
		>
			<Stack gap="lg">
				<Text type="secondary">Changes stay active as you navigate and are remembered in this browser. Use the floating palette button to edit alongside any page. Reset app theme restores the app defaults.</Text>
				<Text>Currency format: <Money amount={1234.56} /></Text>
				<AppThemeEditor showIntro />
				<Accordion items={[{
					value: "integration", title: "Integrate in your app",
					content: <Stack gap="md">
						<Text>Keep theme and provider state above your router. Apply it there with useAppliedTheme and give your UIProvider the same config and themeToStyle(theme). The editor can then open and close without removing the theme.</Text>
						<CodeBlock code={'import { ThemeTweaker, ThemeScope, UIConfigSettings, useAppliedTheme, themeToStyle } from "themelia-ui/features/theme-tweaker"'} />
						<PropTable rows={[
							{ name: "ThemeTweaker", api: "@/components/features/theme-tweaker#ThemeTweaker", type: "value / onValueChange; config / onConfigChange", description: "Controlled editor used by this app. Set apply={false} when the application owns theme application; preview={false} edits the actual app without a sample preview." },
							{ name: "useAppliedTheme", api: "@/components/features/theme-tweaker#useAppliedTheme", type: "theme, target, selfRef, apply, manageModeClass", description: "Keep mounted with target=document and apply=true to apply document-wide values. Set manageModeClass=false when UIProvider owns color scheme." },
							{ name: "ThemeScope", api: "@/components/features/theme-tweaker#ThemeScope", type: "theme / mode / children", description: "Apply a theme to an intentionally isolated subtree. The app editor uses the shared root instead." },
							{ name: "UIConfigSettings", api: "@/components/features/theme-tweaker#UIConfigSettings", type: "config / onChange", description: "Provider settings editor, included under Provider above. Connect its controlled config to your root UIProvider to update mounted consumers." },
						]} />
						<Example id="isolated-theme-scope" title="Isolated theme scopes"
							description="Use a scope only when one region should deliberately differ from the app theme."
							code={`<ThemeScope theme={createTheme({ shared: { "--radius": "0.875rem" } })}>
  <Button>Scoped radius</Button>
</ThemeScope>`}>
							<ThemeScope theme={createTheme({ shared: { "--radius": "0.875rem" } })}>
								<Button>Scoped radius</Button>
							</ThemeScope>
						</Example>
					</Stack>,
				}]} />
			</Stack>
		</ComponentPage>
	)
}
