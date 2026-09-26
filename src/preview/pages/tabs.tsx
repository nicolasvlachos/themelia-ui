import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TabsPage() {
	return (
		<ComponentPage>
			<Example
				example="tabs/tabs"
				title="Tabs"
				description="Structural variants: a rule with an indicator, or a tinted rail with the active tab lifted out of it — and pill, the chips OverflowTabBar draws. The list scrolls rather than wrapping — a second row of tabs reads as a second level of navigation, which it is not."
			/>

			<Example example="tabs/tabs-scroll" title="Overflowing tabs" description="Scroll arrows appear only when the row overflows. Enable edgeFade to soften the edges with hidden tabs. Changing selection reveals the active tab without moving the page." />

			<Example
				example="tabs/overflow-tab-bar"
				title="OverflowTabBar"
				description="Tabs as data, in a row that scrolls rather than wrapping. Wrapping onto a second line changes the page's height as the reader switches, which shifts everything below it; the fade at the edge says there is more. Reach for it for a section rail whose labels are not known at build time — the composable Tabs above stay the default."
			/>

			<Example id="tabs-accessibility" title="Accessibility">
				<Callout>
					Arrows move between tabs, Home and End jump to the ends, and only the selected
					tab is in the tab sequence — so Tab moves out of the tablist into the panel
					rather than through every tab in turn.
				</Callout>
			</Example>

			<Example id="tabs-api" title="API">
				<PropTable
					owners={[
						"Tabs",
						"TabList",
						"Tab",
						"TabPanel",
						"OverflowTabBar",
						"OverflowTabBarStrings",
						"NavigationTabs",
						"LanguageSwitcher",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
