import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FiltersPage() {
	return (
		<ComponentPage>
			<Example
				example="filters/filters"
				title="The bar"
				description="On phones, search stays visible and Filters opens a sheet with applied values, comparisons, and individual clear controls. On larger screens, each pill keeps its edit, comparison, and clear actions."
			/>

			<Example id="filters-rules" title="What the filters decide">
				<Callout label="Rule">
					The provider is <strong>controlled, always</strong>. It holds no filter state of its
					own, because the only place filters really live is the URL — and a provider with its
					own copy is a second source of truth that drifts the first time someone presses Back.
					A consumer with no URL keeps them in a <code>useState</code>; the provider cannot tell.
				</Callout>
				<Text size="sm" type="secondary">
					The comparison travels in a companion key —{" "}
					<code>status=confirmed&amp;status__op=not</code> — and only when it{" "}
					<strong>differs</strong> from the type's default. So an ordinary filter set produces{" "}
					<code>status=confirmed</code> rather than{" "}
					<code>status=confirmed&amp;status__op=equals</code>. A URL a person can read is a URL
					a person can share.
				</Text>
				<Text size="sm" type="secondary">
					Multi-value editors <strong>stage</strong> their value and commit on Apply: every tick
					would be a new request, and picking four statuses would fetch four times on the way to
					the one result the reader wanted. The Apply button appears only once the staged value
					differs from the applied one.
				</Text>
				<Text size="sm" type="secondary">
					Async labels are remembered <strong>outside</strong> the component tree. A pill has to
					name a value the list fetched, but the list is closed by then and the fetch is long
					gone — without the cache the pill reads <code>v-2</code>.
				</Text>
			</Example>

			<Example id="filters-api" title="API">
				<PropTable owners={["FilterProvider", "FilterConfig", "DisplayConfig", "FilterTabs", "FilterLayout"]} />
				<PropTable
					symbols={[
						"defineAsyncSelectConfig",
						"parseFiltersFromQuery",
						"serializeFiltersToQuery",
						"useFilterGroups",
						"FilterPill",
						"FilterValueDisplay",
						"FilterOperatorSelect",
						"FiltersButton",
						"SearchFilter",
						"SearchFilters",
						"FilterEditor",
						"SelectFilterEditor",
						"DateFilterEditor",
						"RangeFilterEditor",
						"TagsFilterEditor",
						"AsyncFilterEditor",
						"FilterErrorBoundary",
						"useAsyncOptions",
						"createFilterCache",
						"useFilterCache",
						"FilterOperator",
						"FilterType",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
