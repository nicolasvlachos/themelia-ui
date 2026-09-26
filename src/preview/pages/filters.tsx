import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FiltersPage() {
	return (
		<ComponentPage
			title="Filters"
			summary="A controlled filter bar. Every value is a string array, because a filter's real home is the URL and a URL has only strings — one shape means one serialiser, one parser, and a filter set that survives a shared link."
			importPath="@/components/features/filters"
			exports={["FilterProvider", "FilterLayout", "useFilters", "serializeFiltersToQuery",
				"FilterPill", "FiltersButton", "FilterTabs", "SearchFilter", "SearchFilters", "FilterValueDisplay", "FilterOperatorSelect", "FilterEditor", "SelectFilterEditor", "DateFilterEditor", "RangeFilterEditor", "TagsFilterEditor", "AsyncFilterEditor", "FilterErrorBoundary", "useFilterGroups", "useAsyncOptions", "createFilterCache", "useFilterCache",
				"FilterOperator", "FilterType",
			]}
		>
			<Example
				example="filters/filters"
				title="The bar"
				description="On phones, search stays visible and Filters opens a sheet with applied values, comparisons, and individual clear controls. On larger screens, each pill keeps its edit, comparison, and clear actions."
				stacked
			/>

			<Example id="filters-rules" title="What the filters decide" stacked>
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
				<PropTable owner="FilterProvider"
					rows={[
						{ name: "FilterProvider filters", type: "FilterConfig[]", required: true, description: "Every filter the surface offers. A filter's `type` decides its editor and which comparisons it offers." },
						{ name: "activeFilters / onFilterChange", type: "ActiveFilter[] / (next) => void", required: true, description: "Controlled. The provider never writes to its own state." },
						{ name: "displayConfig.display", api: "FilterConfig.displayConfig.display", type: "always | collapsed | hidden", description: "`always` keeps a pill on screen with no value, for the one or two filters a screen is really about. `hidden` still applies but never draws — which is how a screen scopes a list to the current account." },
						{ name: "displayConfig.priority", api: "FilterConfig.displayConfig.priority", type: "number", description: "Sort order in the bar. Lower first; ties keep the authored order, so pills do not reshuffle as values come and go." },
						{ name: "asyncConfig", api: "FilterConfig.asyncConfig", type: "AsyncSelectConfig", description: "One channel owning search, caching, abort, and preload — rather than a `loading` prop and an `options` prop the consumer keeps in step by hand." },
						{ name: "defineAsyncSelectConfig", type: "helper", description: "Infers the fetched item type once and keeps it across fetcher and mapToOption; a heterogeneous FilterConfig[] would widen it to unknown." },
						{ name: "validation", api: "FilterConfig.validation", type: "ValidationConfig", description: "min / max / pattern / required, plus a `custom` returning true or a message. zodValidator and predicateValidator bridge the two shapes you probably already have." },
						{ name: "tabs", api: "FilterTabs.tabs", type: "FilterTab[]", description: "Saved sets. A tab is active only when every preset is applied AND nothing else is — so it stops looking selected the moment the reader narrows further." },
						{ name: "parseFiltersFromQuery / serializeFiltersToQuery", type: "functions", description: "Filters ⇄ a plain query record, for whichever router you have. Driven by the CONFIGS, not the query: an undeclared key is somebody else's parameter." },
						{ name: "useFilterGroups", type: "hook", description: "The partition — search / always / active / behind-the-button — for a consumer laying out their own bar. Easy to get subtly wrong and impossible to notice when you do." },
						{ name: "navigating", type: "boolean", description: "A change is in flight. Controls are disabled, open editors close, and an updating status appears while the current results remain visible." },
						{ name: "FilterLayout.mobilePresentation", api: "FilterLayout.mobilePresentation", type: '"sheet" | "inline"', default: '"sheet"', description: "Uses an inset filter sheet and a saved-view select below 768px. Search stays inline. Editor Apply commits values; Back discards unapplied edits; Done closes the sheet. mobileFilters, filterSummary, and done in strings localize the sheet." },
						{ name: "FilterPill", type: "component", description: "One applied filter, as three segments in a group rather than one button. \u201cStatus \u00b7 is \u00b7 Confirmed \u2715\u201d is three separate decisions with three separate targets, and a single button makes two of them unreachable." },
						{ name: "FilterValueDisplay / FilterOperatorSelect", type: "component", description: "The value and comparison segments of a pill. The value draws icons before words \u2014 a reader scanning five pills recognises the status colours before reading any label \u2014 and the operator renders as plain text when there is only one, because a menu offering a single choice is a control that cannot be used and still costs a chevron and a tab stop." },
						{ name: "FiltersButton", type: "component", description: "The add-filter button and its two-step popup: the filters not yet applied, then that filter\u2019s editor with a way back. Two steps rather than nested submenus, which cannot be operated by touch." },
						{ name: "FilterTabs", type: "component", description: "Saved filter sets as tabs or a compact select via display. Both compare values and operators exactly, preserve range endpoint order, and replace previous narrowing. label names the control; strings.customView describes a changed selection." },
						{ name: "SearchFilter / SearchFilters", type: "component", description: "The inline search boxes. A `search` filter never becomes a pill: typing is the interaction, and burying a text field two presses deep is how a search box stops being used." },
						{ name: "FilterEditor and the five typed editors", api: ["FilterEditor", "SelectFilterEditor", "DateFilterEditor", "RangeFilterEditor", "TagsFilterEditor", "AsyncFilterEditor"], type: "component", description: "SelectFilterEditor, DateFilterEditor, RangeFilterEditor, TagsFilterEditor and AsyncFilterEditor, behind one popover. They STAGE their value and commit on Apply \u2014 a multi-select that committed on each tick would be one request per tick." },
						{ name: "FilterErrorBoundary", type: "component", description: "Keeps one broken filter from taking the page with it. A filter\u2019s editor is the most consumer-owned surface in the feature, so it is the one most likely to throw." },
						{ name: "useFilterGroups", type: "hook", description: "Partitions the filter list into the four groups a bar draws differently. Exported so a consumer laying out their own bar does not have to re-derive \u201cwhich filters belong behind the add button\u201d \u2014 a rule that is easy to get subtly wrong and impossible to notice when you do." },
						{ name: "useAsyncOptions", type: "hook", description: "The fetch, debounce and cache behind AsyncFilterEditor, for a caller supplying their own editor against the same lifecycle." },
						{ name: "createFilterCache", type: "() => FilterCache", description: "The async option and label cache. FilterProvider makes one per mount, which is the isolating default: two roots on a page, or two users in a session, never see each other's results. Create one and pass it as FilterProvider's cache when results and pill labels should survive a navigation. It was a Map at module scope, which is one cache for the whole realm — so an embedded widget was served the host application's options, and signing in as somebody else kept the first user's labels." },
						{ name: "useFilterCache", type: "() => FilterCache | null", description: "The cache in scope, or null outside a provider. For a caller writing their own editor that wants to read or seed the same store useAsyncOptions uses." },
						{ name: "FilterOperator / FilterType", type: "const object", description: "The two vocabularies, exported as values rather than types alone so a consumer can build a filter definition without spelling the strings and can switch on them exhaustively." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
