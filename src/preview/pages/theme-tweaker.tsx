import { Text } from "@/components/base/typography"
import { Stack } from "@/components/base/structure"
import { Money } from "@/components/primitives"
import { Accordion } from "@/components/base/accordion"

import { ComponentPage } from "../partials/component-page"
import { AppThemeEditor } from "../partials/app-theme-editor"
import { PropTable } from "../partials/prop-table"
import { CodeBlock } from "../partials/code-block"
import { Example } from "../partials/example"

export function ThemeTweakerPage() {
	return (
		<ComponentPage>
			<Stack gap="lg">
				<Text type="secondary">Changes stay active as you navigate and are remembered in this browser. Use the floating palette button to edit alongside any page. Reset app theme restores the app defaults.</Text>
				<Text>Currency format: <Money amount={1234.56} /></Text>
				<AppThemeEditor showIntro />
				<Accordion items={[{
					value: "integration", title: "Integrate in your app",
					content: <Stack gap="md">
						<Text>Keep theme and provider state above your router. Apply it there with useAppliedTheme and give your UIProvider the same config and themeToStyle(theme). The editor can then open and close without removing the theme. This app does exactly that: its editor is a controlled ThemeTweaker with <code>{"apply={false}"}</code>, whose Provider section is UIConfigSettings, and its theme lives on the shared root rather than in a ThemeScope.</Text>
						<CodeBlock code={'import { ThemeTweaker, ThemeScope, UIConfigSettings, useAppliedTheme, themeToStyle } from "themelia-ui/features/theme-tweaker"'} />
						<PropTable owners={["ThemeTweaker", "useAppliedTheme", "ThemeScope", "UIConfigSettings"]} />
						<Example
							example="theme-tweaker/isolated-theme-scope"
							title="Isolated theme scopes"
							description="Use a scope only when one region should deliberately differ from the app theme. The scope carries a whole theme: here both radii, because a container reads `--radius` and the controls inside it read `--radius-sm`, and a mode, which is light unless the theme names another."
						/>
					</Stack>,
				}]} />
			</Stack>
		</ComponentPage>
	)
}
