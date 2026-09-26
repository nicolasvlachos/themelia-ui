import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TabsPage() {
	return (
		<ComponentPage
			title="Tabs"
			summary="A tab set following the WAI-ARIA pattern: arrows move between tabs, Home and End jump to the ends, and only the selected tab is in the tab sequence."
			importPath="@/components/base/navigation"
			exports={["Tabs", "TabList", "Tab", "TabPanel", "OverflowTabBar", "NavigationTabs", "LanguageSwitcher"
			]}
		>
			<Example
				example="tabs/tabs"
				title="Tabs"
				description="Structural variants: a rule with an indicator, or a tinted rail with the active tab lifted out of it — and pill, the chips OverflowTabBar draws. The list scrolls rather than wrapping — a second row of tabs reads as a second level of navigation, which it is not."
				stacked
			/>

			<Example example="tabs/tabs-scroll" title="Overflowing tabs" description="Scroll arrows appear only when the row overflows. Enable edgeFade to soften the edges with hidden tabs. Changing selection reveals the active tab without moving the page." stacked />

			<Example
				example="tabs/overflow-tab-bar"
				title="OverflowTabBar"
				description="Tabs as data, in a row that scrolls rather than wrapping. Wrapping onto a second line changes the page's height as the reader switches, which shifts everything below it; the fade at the edge says there is more. Reach for it for a section rail whose labels are not known at build time — the composable Tabs above stay the default."
				stacked
			/>

			<Example id="tabs-accessibility" title="Accessibility" stacked>
				<Callout>
					Arrows move between tabs, Home and End jump to the ends, and only the selected
					tab is in the tab sequence — so Tab moves out of the tablist into the panel
					rather than through every tab in turn.
				</Callout>
			</Example>

			<Example id="tabs-api" title="API">
				<PropTable owner="Tabs"
					rows={[
						{ name: "value", type: "string", description: "Controlled selection. Pair with onValueChange." },
						{ name: "TabList variant", type: '"underline" | "enclosed" | "pill"', default: '"underline"', description: "Structural presentation — a rule with an indicator, a tinted rail, or filled chips with no rule. pill is for a row that picks what one list shows (saved views, result types); OverflowTabBar draws it." },
						{ name: "TabList label", type: "string", description: "Accessible name for the tab set." },
						{ name: "TabList edgeFade", type: "boolean", default: "false", description: "Fade only the edges with hidden tabs; updates while scrolling and supports RTL." },
						{ name: "TabList strings", type: "Partial<TabListStrings>", description: "Accessible labels for the automatic previous and next scroll controls." },
						{ name: "TabPanel value", type: "string", description: "Which tab the panel belongs to." },
						{ name: "OverflowTabBar items", type: "OverflowTabItem[]", description: "id, label, and optionally an icon, a badge, an href, or disabled. A tab with an href is a link; without one it is a button." },
						{ name: "OverflowTabBar value / onValueChange", type: "string / (id) => void", description: "The active section. It owns no panels — the caller renders what the id selects." },
						{ name: "OverflowTabBar strings.label", type: "string", default: '"Sections"', description: "Accessible name for the row." },
						{ name: "NavigationTabs variant", type: '"underline" | "pill"', default: '"underline"', description: "The same chip presentation as TabList variant=\"pill\", for a row of routes." },
						{ name: "NavigationTabs items / currentPath / renderLink", type: "NavigationTabItem[] / string / LayoutLinkRenderer", description: "Tabs that NAVIGATE, so they render anchors in a <nav> and the active one follows from the current path. Tabs and TabPanel are for panels in one page; this is for routes, and mixing them is how a browser back button stops working." },
						{ name: "LanguageSwitcher locales / value / onSelect / variant", type: "LocaleOption[] / string / (value) => void / \"pills\" | \"menu\"", description: "The locale control. pills for two or three languages, where every option is worth showing; menu once there are more, where a row of pills becomes a second navigation." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
