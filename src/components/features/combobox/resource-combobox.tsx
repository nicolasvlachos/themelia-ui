/**
 * ResourceCombobox — a self-fetching picker (a preset over `FetchingCombobox`) that owns
 * debounce, abort and race handling. The fetcher resolves or rejects and should honour
 * `signal`. Defaults: browsable from the first keystroke, preloaded on mount.
 *
 * A failed fetch replaces the list content but keeps the selection and the query, for retry.
 */
import type { ReactNode } from "react"

import { DEFAULT_DEBOUNCE_MS } from "@/hooks/use-debounce"

import type { AsyncComboboxStrings } from "./combobox.strings"
import type {
	AsyncComboboxProps, ResourceComboboxErrorContext, ResourceComboboxOptionContext,
} from "./combobox.types"
import { FetchingCombobox } from "./fetching-combobox"

export type { ResourceComboboxErrorContext, ResourceComboboxOptionContext } from "./combobox.types"

export interface ResourceComboboxFetcherArgs {
	/** Trimmed. Empty when preloading. */
	query: string
	/** Advisory — nothing truncates the returned array. */
	limit: number
	/** Aborted when a newer request starts, or on unmount. Pass it to fetch. */
	signal?: AbortSignal
}

export type ResourceComboboxFetcher<T> = (args: ResourceComboboxFetcherArgs) => Promise<T[]>

export interface ResourceComboboxProps<T>
	extends Omit<
		AsyncComboboxProps<T>,
		| "items"
		| "selectedValue"
		| "onSelectedValueChange"
		| "clearSearchOnClose"
		| "searchValue"
		| "onSearchValueChange"
		| "getItemLabel"
		| "getItemKey"
		| "loading"
		| "showListContent"
		| "renderItem"
		| "error"
	> {
	fetcher: ResourceComboboxFetcher<T>
	/** Controlled. Omit entirely to let the component own the selection. */
	value?: T | null
	/** The starting selection when uncontrolled. Ignored once `value` is passed. */
	defaultValue?: T | null
	onValueChange?: (value: T | null) => void
	/** The query. Controlled (e.g. from the URL); omit to let the component own it. */
	searchValue?: string
	/** The starting query when uncontrolled. */
	defaultSearchValue?: string
	/** Every keystroke, with the raw untrimmed value. */
	onSearchValueChange?: (value: string) => void
	/** The popup's starting state when `open` is not controlled. */
	defaultOpen?: boolean
	/** Clears the query when the popup closes. Defaults to `false`. A failed query is always kept for retry. */
	clearSearchOnClose?: boolean
	/** A further wait before the fetcher runs, after the loading state is showing. For rate-limited endpoints. */
	requestDelay?: number
	onAfterFetch?: (items: T[], context: ResourceComboboxFetcherArgs) => void
	/** Aborted and superseded requests never reach this. */
	onError?: (error: unknown, context: ResourceComboboxFetcherArgs) => void
	/** Stable identity. Also decides which option reads as selected. */
	getKey: (item: T) => string
	getLabel: (item: T) => string
	/** Second line beside the label — what distinguishes two rows of one name. */
	getDescription?: (item: T) => ReactNode
	/** Third, quieter still. */
	getMeta?: (item: T) => ReactNode
	/** Replaces the whole option row. `getLabel` still supplies the input's text. */
	renderOption?: (item: T, context: ResourceComboboxOptionContext) => ReactNode
	limit?: number
	/** Characters required before fetching. Defaults to `0` (unlike `AsyncCombobox`'s `3`); an empty input follows `preload`. */
	minSearchLength?: number
	/** Fetches with an empty query, so there is something to look at before typing. */
	preload?: boolean
	errorMessage?: ReactNode
	renderError?: (context: ResourceComboboxErrorContext) => ReactNode
	strings?: Partial<AsyncComboboxStrings>
}

export function ResourceCombobox<T>({
	fetcher,
	onAfterFetch,
	onError,
	getKey,
	getLabel,
	limit = 10,
	debounceMs = DEFAULT_DEBOUNCE_MS,
	preload = true,
	minSearchLength = 0,
	defaultValue = null,
	errorMessage,
	...props
}: ResourceComboboxProps<T>) {
	/* Adapters from the engine's query-only API to this picker's `{ query, limit, signal }`. */
	const args = (query: string, signal?: AbortSignal): ResourceComboboxFetcherArgs => ({ query, limit, signal })

	return (
		<FetchingCombobox<T>
			{...props}
			hook="resource-combobox--component"
			slot="resource-combobox"
			fetchData={async (query, { signal }) => {
				const context = args(query, signal)
				const items = await fetcher(context)
				if (!signal?.aborted) onAfterFetch?.(items, context)
				return items
			}}
			onError={(error, query) => onError?.(error, args(query))}
			getItemLabel={getLabel}
			getItemKey={getKey}
			debounceMs={debounceMs}
			preload={preload}
			minSearchLength={minSearchLength}
			defaultValue={defaultValue}
			errorTitle={errorMessage}
		/>
	)
}
