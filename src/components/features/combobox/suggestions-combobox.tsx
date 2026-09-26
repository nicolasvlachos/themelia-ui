/**
 * SuggestionsCombobox — `useSuggestions` behind the kit's combobox. A `FetchingCombobox`
 * preset (like `ResourceCombobox`) in the hook's vocabulary — `fetchData(query, { signal })`,
 * `itemKey`, `itemText`, `query`/`onQueryChange` — and with its defaults: one character
 * before a request, no preload.
 */
import type { ReactNode, RefObject } from "react"

import {
	defaultAsyncComboboxStrings, defaultSuggestionsStrings, type SuggestionsStrings,
} from "./combobox.strings"
import { FetchingCombobox } from "./fetching-combobox"
import type { UseSuggestionsConfig } from "./use-suggestions"

export interface SuggestionsErrorContext {
	error: unknown
	query: string
	retry: () => void
}

export interface SuggestionsComboboxProps<T> extends UseSuggestionsConfig<T> {
	/** Applied to the search input, so a `FormField` label can address it. */
	id?: string
	itemKey: (item: T) => string | number
	itemText: (item: T) => string
	renderItem?: (item: T) => ReactNode
	renderError?: (context: SuggestionsErrorContext) => ReactNode
	allowClear?: boolean
	/** Resets the query when the list closes. A query that failed is kept, for the retry. */
	clearInputOnClose?: boolean
	disabled?: boolean
	className?: string
	strings?: Partial<SuggestionsStrings>
	/** The form field name, for native form submission. */
	name?: string
	required?: boolean
	invalid?: boolean
	onBlur?: () => void
	/** Mounts the popup inside this element instead of the default portal root. */
	portalContainer?: RefObject<HTMLElement | null>
	/** Emphasises the matched substring. Ignored when `renderItem` is set. */
	highlightMatch?: boolean
}

export function SuggestionsCombobox<T>({
	fetchData,
	itemKey,
	itemText,
	renderItem,
	minQueryLength = 1,
	preload = false,
	query,
	defaultQuery,
	onQueryChange,
	allowClear = true,
	clearInputOnClose = false,
	disabled = false,
	strings,
	...props
}: SuggestionsComboboxProps<T>) {
	const copy = { ...defaultSuggestionsStrings, ...strings }
	/* Without `formatTypeMore`, a supplied `startTypingMessage` is used rather than the English default. */
	const typeMore: (remaining: number) => string =
		strings?.formatTypeMore ??
		(strings?.startTypingMessage !== undefined
			? () => copy.startTypingMessage
			: defaultAsyncComboboxStrings.formatTypeMore)

	return (
		<FetchingCombobox<T>
			{...props}
			hook="suggestions-combobox--component"
			slot="suggestions"
			fetchData={fetchData}
			getItemLabel={itemText}
			getItemKey={(item) => String(itemKey(item))}
			renderOption={renderItem ? (item) => renderItem(item) : undefined}
			minSearchLength={minQueryLength}
			preload={preload}
			searchValue={query}
			defaultSearchValue={defaultQuery}
			onSearchValueChange={onQueryChange}
			clearable={allowClear}
			clearSearchOnClose={clearInputOnClose}
			disabled={disabled}
			strings={{
				placeholder: copy.placeholder,
				noResults: copy.emptyMessage,
				searching: copy.loadingMessage,
				formatTypeToSearch: () => copy.startTypingMessage,
				formatTypeMore: typeMore,
				errorTitle: copy.errorMessage,
				retry: copy.retry,
			}}
		/>
	)
}
