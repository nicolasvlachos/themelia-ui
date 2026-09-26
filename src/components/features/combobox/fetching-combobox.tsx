/**
 * The self-fetching combobox — the internal engine behind the `ResourceCombobox` and
 * `SuggestionsCombobox` presets (they differ only in vocabulary and defaults).
 *
 * `useSuggestions` feeding `AsyncCombobox`, plus:
 * - threshold: an empty field follows `preload`, a typed one `minSearchLength`;
 * - error: replaces the list content, keeps the selection, and shows a retry;
 * - option: label with description and meta, optionally highlighted.
 */
import { useCallback, type ReactNode } from "react"

import { ErrorState } from "@/components/base/feedback"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { AsyncCombobox } from "./async-combobox"
import { defaultAsyncComboboxStrings } from "./combobox.strings"
import type {
	AsyncComboboxProps, ResourceComboboxErrorContext, ResourceComboboxOptionContext,
} from "./combobox.types"
import { HighlightedText } from "./highlighted-text"
import { useSuggestions, type MaybePromise, type SuggestionsFetchContext } from "./use-suggestions"
import styles from "./combobox.module.css"

export interface FetchingComboboxProps<T>
	extends Omit<
		AsyncComboboxProps<T>,
		| "items"
		| "selectedValue"
		| "onSelectedValueChange"
		| "clearSearchOnClose"
		| "searchValue"
		| "onSearchValueChange"
		| "loading"
		| "showListContent"
		| "renderItem"
		| "error"
	> {
	/** The preset's public root hook, `{name}--component`. */
	hook: string
	/** The preset's `data-slot`. */
	slot: string
	/** Receives the trimmed query. */
	fetchData: (query: string, context: SuggestionsFetchContext) => MaybePromise<T[]>
	/** Receives the trimmed query that failed. Aborts never reach it. */
	onError?: (error: unknown, query: string) => void
	preload: boolean
	requestDelay?: number
	searchValue?: string
	defaultSearchValue?: string
	onSearchValueChange?: (value: string) => void
	value?: T | null
	defaultValue?: T | null
	onValueChange?: (value: T | null) => void
	defaultOpen?: boolean
	/** Clears the query on close — but never a query that failed, or the retry loses it. */
	clearSearchOnClose?: boolean
	getDescription?: (item: T) => ReactNode
	getMeta?: (item: T) => ReactNode
	renderOption?: (item: T, context: ResourceComboboxOptionContext) => ReactNode
	/** The failure's title. Defaults to `strings.errorTitle`. */
	errorTitle?: ReactNode
	renderError?: (context: ResourceComboboxErrorContext) => ReactNode
	/** On the wrapper, which also holds the error, not on the input. */
	className?: string
}

function isSimpleText(value: ReactNode): value is string | number {
	return typeof value === "string" || typeof value === "number"
}

function Detail({ children }: { children: ReactNode }) {
	return isSimpleText(children) ? (
		<Text tag="span" size="xs" type="secondary" truncate>
			{children}
		</Text>
	) : (
		children
	)
}

export function FetchingCombobox<T>({
	hook,
	slot,
	fetchData,
	onError,
	preload,
	requestDelay,
	minSearchLength = 0,
	debounceMs,
	searchValue,
	defaultSearchValue,
	onSearchValueChange,
	value,
	defaultValue,
	onValueChange,
	open,
	defaultOpen,
	onOpenChange,
	clearSearchOnClose = false,
	getItemLabel,
	getItemKey,
	getDescription,
	getMeta,
	renderOption,
	highlightMatch,
	errorTitle,
	renderError,
	strings,
	disabled = false,
	className,
	...props
}: FetchingComboboxProps<T>) {
	const copy = { ...defaultAsyncComboboxStrings, ...strings }
	const getKey = getItemKey ?? getItemLabel

	const suggestions = useSuggestions<T>({
		fetchData: (query, context) => fetchData(query.trim(), context ?? {}),
		onError: (error, query) => onError?.(error, query.trim()),
		// A typed query needs at least one character; disabled, nothing qualifies.
		minQueryLength: disabled ? Number.POSITIVE_INFINITY : Math.max(1, minSearchLength),
		preload: preload && !disabled,
		debounceMs,
		requestDelay,
		query: searchValue,
		defaultQuery: defaultSearchValue,
		onQueryChange: onSearchValueChange,
		value,
		defaultValue,
		onValueChange,
		open,
		defaultOpen,
		onOpenChange,
	})

	const query = suggestions.query.trim()
	const failed = suggestions.isError
	const { setOpen, setQuery, retry } = suggestions

	/* The status row's threshold: an empty field follows `preload`, a typed one `minSearchLength`. */
	const threshold = query === "" ? (preload && !disabled ? 0 : Math.max(1, minSearchLength)) : minSearchLength

	const handleOpenChange = useCallback(
		(next: boolean) => {
			setOpen(next)
			// A failed query survives, so the retry below the field has something to retry.
			if (!next && clearSearchOnClose && !failed) setQuery("")
		},
		[clearSearchOnClose, failed, setOpen, setQuery],
	)

	const selectedKey = suggestions.value ? getKey(suggestions.value) : null

	const renderItem = useCallback(
		(item: T) => {
			if (renderOption) {
				return renderOption(item, { query, isSelected: selectedKey !== null && getKey(item) === selectedKey })
			}

			const label = getItemLabel(item)
			const description = getDescription?.(item)
			const meta = getMeta?.(item)
			const detailed = !!description || !!meta

			return (
				<span className={styles.option}>
					{/* Medium only beside detail, where it has something to stand out from. */}
					<Text tag="span" size="inherit" type="inherit" weight={detailed ? "medium" : undefined} lineHeight="tight" truncate>
						{highlightMatch && query ? <HighlightedText text={label} highlight={query} /> : label}
					</Text>
					{detailed && (
						<span className={styles.optionMeta}>
							{!!description && <Detail>{description}</Detail>}
							{!!meta && <Detail>{meta}</Detail>}
						</span>
					)}
				</span>
			)
		},
		[getDescription, getItemLabel, getKey, getMeta, highlightMatch, query, renderOption, selectedKey],
	)

	const errorNode = failed
		? (renderError?.({ error: suggestions.error, query, retry }) ?? (
				<ErrorState
					title={errorTitle ?? copy.errorTitle}
					onRetry={retry}
					strings={{ retry: copy.retry }}
					className={styles.errorState}
				/>
			))
		: null

	return (
		<div data-slot={slot} className={cx(hook, className)}>
			<AsyncCombobox<T>
				{...props}
				disabled={disabled}
				items={suggestions.items}
				selectedValue={suggestions.value}
				onSelectedValueChange={suggestions.setValue}
				// Closing is handled above, where a failed query can be kept.
				clearSearchOnClose={false}
				searchValue={suggestions.query}
				onSearchValueChange={setQuery}
				getItemLabel={getItemLabel}
				getItemKey={getItemKey}
				loading={!failed && suggestions.isLoading}
				// An error replaces the list content (see header).
				showListContent={!failed}
				minSearchLength={threshold}
				debounceMs={debounceMs}
				strings={strings}
				renderItem={renderItem}
				open={suggestions.open}
				onOpenChange={handleOpenChange}
			/>
			{errorNode}
		</div>
	)
}
