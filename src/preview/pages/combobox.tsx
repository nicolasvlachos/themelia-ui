import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ComboboxPage() {
	return (
		<ComponentPage
			title="Combobox"
			summary="One combobox at two levels. The pickers are what most fields want — ResourceCombobox and SuggestionsCombobox fetch for you, AsyncCombobox and AsyncMultiCombobox take results you already hold — and all four run on one engine: a debounced query, a minimum length, a status row, grouping, an inline create, scroll pagination and an apply footer. Underneath is the Base UI anatomy with the kit's field surface applied; drop to the parts when no picker fits."
			importPath="@/components/base/combobox"
			exports={["ComboboxRoot", "ComboboxInputTrigger", "ComboboxPopup", "ComboboxPopupInput", "ComboboxItem", "ComboboxTrigger", "ComboboxValue", "ComboboxList", "ComboboxEmpty", "ComboboxGroup", "ComboboxGroupLabel", "ComboboxChips", "ComboboxChip", "ComboboxChipsInput", "ComboboxPortal", "ComboboxPositioner", "ComboboxArrow", "ComboboxBackdrop", "ComboboxClear", "ComboboxCollection", "ComboboxInput", "ComboboxItemIndicator", "ComboboxSeparator", "ComboboxStatus", "useComboboxFilter"
			]}
			alsoImports={[
				{ importPath: "@/components/features/combobox", title: "Async combobox", exports: ["ResourceCombobox", "SuggestionsCombobox", "AsyncCombobox", "AsyncMultiCombobox", "ComboboxDropdown", "HighlightedText", "useComboboxCore", "useSuggestions"] },
			]}
		>
			<Example
				example="combobox/combobox-picker"
				title="A picker that fetches"
				description="The combobox most fields want. Give it a fetcher and it owns the rest: one request per pause in typing, the previous request aborted when a new one starts, and a response that arrives late never overwrites a newer one. It preloads, so the list is there on open, and a row can carry a description and meta beside its label. Everything further down is either a preset of this same engine or the parts it is built from."
			/>

			<Example
				example="combobox/suggestions"
				title="SuggestionsCombobox"
				description="The same engine in the vocabulary of useSuggestions — fetchData(query, { signal }), itemKey, itemText — with that hook's defaults: one character before a request, and no preload unless asked. useSuggestions on its own is the state machine for a surface that is not a combobox at all, such as a command palette or a search bar with its own results panel."
			/>

			<Example
				example="combobox/resource-combobox"
				title="When the fetch fails"
				description="The error is exclusive: the list is suppressed and a retry appears under the field, but the selection survives — a failure to load MORE options is not a reason to lose the one already chosen — and so does the query, so the retry asks the same question again. Typing on hides the error at once; it belonged to the query that failed. Untick the box and retry."
			/>

			<Example
				example="combobox/async-combobox"
				title="Results you already hold"
				description="AsyncCombobox is the engine without the fetch, for a screen that already has a data layer: the consumer holds the items, the query and the loading flag. Type at least three characters — below the threshold the status row says how many more are needed, and no search fires. Grouped by region, the matched run emphasised."
			/>

			<Example
				example="combobox/async-multi-combobox"
				title="Several at once"
				description="AsyncMultiCombobox: chips in the field, checks in the list. Selections are merged ahead of the results and de-duplicated by key, so a chosen country stays visible and checked even when the current search does not return it — which is what happens on the very next keystroke. Each chip's remove control is named after it."
			/>

			<Example
				example="combobox/apply-button"
				title="Apply before it counts"
				description="With applyButton, edits accumulate in a draft until Apply. For a filter that costs something to apply — a query, a page load. Cancel or dismissing puts the draft back, so closing without committing cannot half-apply a change. Without it every toggle commits, which is right when committing is free."
			/>

			<Example
				example="combobox/creatable"
				title="Create what is missing"
				description="With creatable, an inline create row appears when the typed text matches no existing label — compared case-insensitively, because offering “Create Greece” beside an existing “greece” is offering a duplicate. It arrives at onCreate rather than at onSelectedValueChange: the consumer creates the record and decides what, if anything, to select."
			/>

			<Example id="combobox-rule" title="The pickers do not filter">
				<Callout label="Rule">
					<code>items</code> is rendered as given, regardless of what has been typed. That
					is the only correct behaviour for a server-driven search — filtering again in the
					browser would hide rows the server matched on a field the label does not show —
					and it means a <strong>local-data</strong> consumer of <code>AsyncCombobox</code>{" "}
					has to filter before passing. Passing an unfiltered array gives a list that never
					narrows, which is the mistake this rule exists to prevent.
				</Callout>
				<Text size="sm" type="secondary">
					<code>ResourceCombobox</code> and <code>SuggestionsCombobox</code> own the fetch,
					so neither has this problem — reach for them unless the screen already has a data
					layer. A short, fixed list with no search at all is a <code>Select</code>.
				</Text>
			</Example>

			<Example
				example="combobox/combobox-field"
				title="The parts: one field surface"
				description="Below the pickers are the parts they are built from. The input, the trigger, and the chips container all carry the shared field attributes, so they wear the same height, border, focus ring, and invalid state as Input and Select — not an approximation of them."
			/>

			<Example
				example="combobox/combobox-select"
				title="Without free text"
				description="The whole field as one trigger, when the value can only come from the list. The search band inside the popup is required, not decoration: it takes focus on open and owns the arrow keys, Home, End and Enter. Without it the list can only be used with a pointer — for a short list with no search, use Select."
			/>

			<Example
				example="combobox/combobox-multiple"
				title="Multiple"
				description="Chips inside the field rather than a list beneath it. A chip lights up when it is the keyboard target, because backspacing through chips is how a keyboard user removes them."
			/>

			<Example id="combobox-anatomy" title="Pickers first, parts when none fits">
				<Callout label="Rule">
					Start from a picker. The parts exist for the screen none of them covers — a row
					layout, a trigger, a list that is not a search — so it drops to the anatomy
					instead of forking a picker. The pickers compose exactly these parts, so the two
					look and behave alike wherever they meet.
				</Callout>
			</Example>

			<Example id="async-combobox-api" title="Picker API">
				<PropTable owner="AsyncCombobox"
					rows={[
						{ name: "items / searchValue", type: "T[] / string", required: true, description: "Both controlled. See the rule above: items is not filtered." },
						{ name: "getItemLabel / getItemKey", type: "(item) => string", description: "The label is also the identity when no key is given, and what the create row's duplicate check compares. Supply a key whenever labels are not unique — two people of one name collide, and de-duplicating drops one." },
						{ name: "minSearchLength", type: "number", default: "3", description: "Below it the status row replaces the list, the create row is withheld, and onSearch does not fire. 0 makes the list browsable before typing." },
						{ name: "onSearch / debounceMs", type: "(value: string) => void / number", default: "300", description: "Fires after the quiet period with the TRIMMED value. It does not fire when the reader deletes back below the threshold, so it cannot be used to clear results — do that from onSearchValueChange." },
						{ name: "clearSearchOnClose", type: "boolean", default: "true", description: "Clears the query when the popup closes, so the next open is not filtered by something forgotten. The self-fetching pickers default it off, and never clear a query that failed." },
						{ name: "creatable / onCreate", type: "boolean / (value) => void", description: "The create row arrives at onCreate, not as a selection. Withheld while nothing is typed, and when the text matches an existing label case-insensitively." },
						{ name: "hasMore / onLoadMore / loadingMore", type: "boolean / () => void / boolean", description: "Scroll pagination at 80% of the list. A cooldown after each request stops a second page being asked for while the first is in flight — the list has not grown, so the scroll position is still past the threshold." },
						{ name: "applyButton / onApply / onCancel", api: ["AsyncMultiCombobox.applyButton", "AsyncMultiCombobox.onApply", "AsyncMultiCombobox.onCancel"], type: "boolean / () => void", description: "Multi only. Edits go to a draft until Apply; Cancel and dismissal both restore the committed set." },
						{ name: "showListContent", type: "boolean", default: "true", description: "Off suppresses the status, results, create row, and footer WITHOUT clearing the selection. How the self-fetching pickers present an error." },
						{ name: "strings", type: "Partial<AsyncComboboxStrings>", description: "Every word the pickers render, including the clear and chevron names and each chip's remove control." },
						{ name: "ResourceCombobox fetcher", type: "({ query, limit, signal }) => Promise<T[]>", required: true, description: "Debounce, abort, and the race guard are owned for you. The query arrives trimmed. Honour the signal so an abort does not surface as a failure." },
						{ name: "ResourceCombobox minSearchLength", type: "number", default: "0", description: "Zero here, unlike the controlled combobox's 3 — a resource picker is expected to be browsable from the first keystroke. An empty field is governed by preload, not by this." },
						{ name: "ResourceCombobox preload", type: "boolean", default: "true", description: "Fetches the empty query on mount, without waiting out the debounce, so the list is there on open. Off, an empty field asks the reader to type instead of claiming there are no results." },
						{ name: "ResourceCombobox searchValue / defaultSearchValue / onSearchValueChange", type: "string / string / (value) => void", description: "The query, controllable on its own — for a query that lives in the URL. Omit all three to let the picker own it." },
						{ name: "ResourceCombobox requestDelay", type: "number", description: "A second wait, AFTER the loading state is showing. For a rate-limited endpoint: the reader sees something is happening, and the request that would have been refused is never made." },
						{ name: "SuggestionsCombobox fetchData / itemKey / itemText", type: "(query, { signal }) => T[] | Promise<T[]> / (item) => string | number / (item) => string", required: true, description: "The same engine as ResourceCombobox in the hook's words. Defaults to one character before a request and no preload." },
						{ name: "SuggestionsCombobox minQueryLength", type: "number", default: "1", description: "Characters before a request, not counting surrounding whitespace." },
						{ name: "useSuggestions requestDelay", api: "@/components/features/combobox#useSuggestions.requestDelay", type: "number", default: "0", description: "The same second wait on the hook, for a surface that is not a combobox." },
						{ name: "ComboboxDropdown", api: "@/components/features/combobox#ComboboxDropdown", type: "component", description: "The popup: status row, results, create row, pager and footer. It renders an empty popup rather than nothing, because a popup that vanishes mid-type reads as a broken control rather than an empty result." },
						{ name: "HighlightedText", api: "@/components/features/combobox#HighlightedText", type: "component", description: "The matched span inside a result label. Exported so a custom row keeps the highlight rather than rendering a plain string beside ones that have it." },
						{ name: "useComboboxCore", api: "@/components/features/combobox#useComboboxCore", type: "hook", description: "The list state every picker shares: the threshold, the selection merged ahead of the results, the groups, the create row and the pager. The pickers differ only in what selected means, the field, and where the results come from." },
						{ name: "useSuggestions", api: "@/components/features/combobox#useSuggestions", type: "hook", description: "The request lifecycle the self-fetching pickers run on — query, results, loading, error, selection and open, each controllable on its own — for a caller putting it behind their own field." },
					]}
				/>
			</Example>

			<Example id="combobox-api" title="Parts API">
				<PropTable
					rows={[
						{ name: "ComboboxRoot", type: "Base UI Combobox.Root", description: "State: value, onValueChange, inputValue, onInputValueChange, items, multiple." },
						{ name: "ComboboxInputTrigger", type: "Input.Props & { showClear, invalid, strings }", description: "Input plus its trailing chevron and optional clear. Trailing padding is computed from the same variables that size the controls; strings names the two controls." },
						{ name: "ComboboxPopupInput", type: "Input.Props", description: "The search field INSIDE the popup, for a combobox opened from a button (ComboboxTrigger) rather than typed into. Focus lands in it when the popup opens, and the arrows still move through the list below it." },
						{ name: "ComboboxTrigger / ComboboxValue", type: "Trigger.Props / Value.Props", description: "The whole field as one trigger, for a value that can only come from the list, and the current selection shown in it." },
						{ name: "ComboboxPopup", type: "Popup.Props", description: "Anchored to the field's width — unlike a dropdown menu, a listbox that does not line up with its field reads as a different control." },
						{ name: "ComboboxItem", type: "Item.Props", description: "Row with a trailing selection check. Children go in the label slot. The same row the pickers render." },
						{ name: "ComboboxList / ComboboxEmpty / ComboboxGroup / ComboboxGroupLabel / ComboboxSeparator", type: "component", description: "The results and how they are divided. Empty renders only when a search returns nothing, so “no matches” never flashes before the first keystroke." },
						{ name: "ComboboxChips / ComboboxChip / ComboboxChipsInput", type: "component", description: "Multi-select: the container is the field, and the input sits among the chips so typing continues where the last selection ended. A chip names its remove control after its text; one with richer content takes strings.removeChip." },
						{ name: "ComboboxPortal / ComboboxPositioner / ComboboxArrow / ComboboxBackdrop", type: "component", description: "The popup’s placement machinery. Portal escapes an ancestor that clips or transforms; the positioner anchors to the trigger and flips when there is no room below." },
						{ name: "ComboboxInput / ComboboxClear / ComboboxItemIndicator / ComboboxStatus / ComboboxCollection", type: "component", description: "The query field, the control that empties it, the tick on a chosen item, the async status line (hidden while empty), and the renderer that maps a list to items." },
						{ name: "useComboboxFilter", type: "() => { contains, startsWith, … }", description: "Locale-aware matchers from Base UI, for a caller filtering a list themselves who still wants the popup's rules about what counts as a match." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
