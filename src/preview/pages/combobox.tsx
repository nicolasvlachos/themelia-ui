import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ComboboxPage() {
	return (
		<ComponentPage>
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
				<PropTable
					owners={["AsyncCombobox", "AsyncMultiCombobox", "ResourceCombobox", "SuggestionsCombobox", "useSuggestions"]}
				/>
				<PropTable symbols={["ComboboxDropdown", "HighlightedText", "useComboboxCore"]} />
			</Example>

			<Example id="combobox-api" title="Parts API">
				<PropTable
					symbols={[
						"ComboboxRoot",
						"ComboboxPopupInput",
						"ComboboxTrigger",
						"ComboboxValue",
						"ComboboxPopup",
						"ComboboxItem",
						"ComboboxList",
						"ComboboxEmpty",
						"ComboboxGroup",
						"ComboboxGroupLabel",
						"ComboboxSeparator",
						"ComboboxChips",
						"ComboboxChip",
						"ComboboxChipsInput",
						"ComboboxPortal",
						"ComboboxPositioner",
						"ComboboxArrow",
						"ComboboxBackdrop",
						"ComboboxInput",
						"ComboboxClear",
						"ComboboxItemIndicator",
						"ComboboxStatus",
						"ComboboxCollection",
						"useComboboxFilter",
					]}
				/>
				<PropTable owners={["ComboboxInputTrigger"]} />
			</Example>
		</ComponentPage>
	)
}
