import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function GlobalSearchPage() {
	return (
		<ComponentPage
			title="Global search"
			summary="The command palette: one list across people, bookings, invoices, and files, walked with the arrow keys. It does not search — the query is controlled and the results are given, because debounce, endpoint, ranking, and permissions all belong to the app. What it owns is the part every palette shares."
			importPath="@/components/features/global-search"
			exports={["GlobalSearch", "GlobalSearchDialog", "useGlobalSearch",
				"GlobalSearchInput", "GlobalSearchTabs", "GlobalSearchResultRow", "GlobalSearchIdleState", "GlobalSearchEmptyState", "GlobalSearchFooter",
			]}
		>
			<Example
				example="global-search/panel"
				title="The panel"
				description="Type in the field, then use ↑ ↓ and Enter — the pointer moves the same highlight the keys do, so Enter always opens the row under the cursor. Results bucket by their group key; the tab strip and the group headings are both generated from what came back."
			/>

			<Example
				example="global-search/dialog"
				title="The palette"
				description="The same panel in the kit's modal surface: focus lands in the field, Escape closes, and the backdrop dismisses. The dialog carries no chrome of its own — the panel already draws the card, and stacking both would put a border inside a border."
			/>

			<Example id="search-rules" title="Where the regions come from">
				<Callout label="Rule">
					Exactly one of <strong>idle / loading / empty / results</strong> shows, resolved in
					that order. Idle holds until the query is longer than one character, because a single
					letter matches everything and answering it wastes a request — and empty needs the same
					two, so the reader never reads “no results” while still typing the first one.
				</Callout>
				<Text size="sm" type="secondary">
					A result carries a trailing figure twice in the markup: a wide row gives it its own
					column against the right edge, a narrow one puts it on its own line below the context. Both are
					rendered and a container query hides one, because which is right depends on the width
					of the <strong>row</strong>, which no amount of React knows.
				</Text>
				<Text size="sm" type="secondary">
					<code>useGlobalSearch</code> is the state without the panel: the same{" "}
					<code>flat</code> list the keys walk and the rows are drawn from, so a row can never
					highlight one entry while Enter opens another.
				</Text>
			</Example>

			<Example id="search-api" title="API">
				<PropTable owner="GlobalSearch"
					rows={[
						{ name: "query / onQueryChange", type: "string / (q) => void", required: true, description: "Controlled, always. The palette never searches — it renders what it is given." },
						{ name: "results", type: "GlobalSearchResult[]", description: "One shape for every kind, with optional parts: avatar OR thumbnail, a badge, meta, tags, a timestamp, a trailing figure. A union per kind would be honest about the data and useless for a list that renders them all the same way." },
						{ name: "result.group", api: "GlobalSearchResult.group", type: "string", required: true, description: "The bucket. Tabs and group headings are both generated from the groups that actually returned something." },
						{ name: "groupLabels", type: "Partial<Record<group, ReactNode>>", description: "Names a group. Without it the raw key shows, which is a useful default only while you are wiring it up." },
						{ name: "loading", type: "boolean", description: "Swaps the input's clear control for a spinner and shows the loading region. Hidden results cannot be selected while the loading region is visible." },
						{ name: "idleSections", type: "GlobalSearchIdleSection[]", description: "Recent queries and curated suggestions. The palette has no memory of its own — whose recents these are is a question only the app can answer." },
						{ name: "tabs", type: "GlobalSearchTab[]", description: "Replaces the generated “All + one per group” strip, for a fixed set of tabs that should not appear and disappear with the results." },
						{ name: "slots", type: "GlobalSearchSlots", description: "input, tabs, idle, empty, loading, footer, and renderResult — every region, replaceable one at a time." },
						{ name: "onResultSelect", type: "(result) => void", description: "Fires on click and on Enter, with the whole result including its free-form `data`." },
						{ name: "onClose", type: "() => void", description: "Escape. The dialog presentation wires this to closing itself; a panel embedded in a page usually wants it too." },
						{ name: "GlobalSearchDialog", type: "component", description: "The palette presentation over ActionDialog: focus trap, portal, scroll lock, and a dialog role — none of which a hand-rolled fixed backdrop has." },
						{ name: "useGlobalSearch", type: "hook", description: "grouped, tabCounts, activeTab, flat, activeIndex, and onKeyDown — for a palette whose markup is entirely yours." },
						{ name: "GlobalSearchInput", type: "component", description: "The search row. Thin on purpose \u2014 base Input already owns the leading icon, the clear and the sizing, so this only wires the palette\u2019s key handling to it." },
						{ name: "GlobalSearchTabs", type: "component", description: "The group filter strip, built on OverflowTabBar rather than Tabs: these narrow one list rather than switching between panels, and the distinction decides what the arrow keys do." },
						{ name: "GlobalSearchResultRow", type: "component", description: "One rich result \u2014 icon, title, context and shortcut. Exported so a consumer rendering their own groups keeps the row\u2019s highlight and keyboard behaviour." },
						{ name: "GlobalSearchIdleState / GlobalSearchEmptyState", type: "component", description: "Before there is anything to search, and after a search that found nothing. Idle shows recent queries and curated suggestions, both supplied by the consumer \u2014 the palette does not remember anything itself." },
						{ name: "GlobalSearchFooter", type: "component", description: "The keyboard-hint strip. It is the only place a reader is told which three keys the palette answers to." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
