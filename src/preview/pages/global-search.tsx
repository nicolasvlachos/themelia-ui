import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function GlobalSearchPage() {
	return (
		<ComponentPage>
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
				<PropTable owners={["GlobalSearch", "GlobalSearchResult"]} />
				<PropTable
					symbols={[
						"GlobalSearchDialog",
						"useGlobalSearch",
						"GlobalSearchInput",
						"GlobalSearchTabs",
						"GlobalSearchResultRow",
						"GlobalSearchIdleState",
						"GlobalSearchEmptyState",
						"GlobalSearchFooter",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
