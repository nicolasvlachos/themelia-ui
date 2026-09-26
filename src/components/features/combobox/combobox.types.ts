/**
 * AsyncCombobox — the search-driven combobox over `base/combobox`: debounced query, minimum
 * length, status row, grouping, inline create, scroll pagination and an apply footer.
 *
 * It does NOT filter `items`: what is passed is what renders. Local-data consumers must
 * filter before passing.
 */
import type { ReactNode, RefObject } from "react"

import type { AsyncComboboxStrings } from "./combobox.strings"

export interface AsyncComboboxSharedProps<T> {
	/** Applied to the search input (not a wrapper), so a `FormField` label can target it. */
	id?: string
	/** In display order. Rendered as given, never filtered. */
	items: T[]
	/** The text in the field. Controlled. */
	searchValue: string
	/** Every keystroke, with the raw untrimmed value. */
	onSearchValueChange: (value: string) => void
	/**
	 * The visible label. Also the identity when `getItemKey` is absent, and the string the
	 * create row's duplicate check compares against.
	 */
	getItemLabel: (item: T) => string
	/** Stable identity. Defaults to the label; supply it whenever labels are not unique. */
	getItemKey?: (item: T) => string
	loading?: boolean
	/**
	 * Whether list-owned content (status, results, create row, footer) may render. Defaults to
	 * `true`. Turning it off does not clear the selection.
	 */
	showListContent?: boolean
	/**
	 * Characters required before the list becomes active. Defaults to 3. Below it the status
	 * row replaces results and `onSearch` does not fire; `0` allows browsing before typing.
	 */
	minSearchLength?: number
	strings?: Partial<AsyncComboboxStrings>
	disabled?: boolean
	className?: string
	clearable?: boolean
	/** Replaces an option's content. Takes precedence over `highlightMatch`. */
	renderItem?: (item: T) => ReactNode
	/** Mounts the popup inside this element instead of the default portal root. */
	portalContainer?: RefObject<HTMLElement | null>

	name?: string
	invalid?: boolean
	/** A validation message under the field. Also marks it invalid. */
	error?: string
	required?: boolean
	onBlur?: () => void

	/**
	 * The server query: fires after `debounceMs` with the trimmed value, only at or above
	 * `minSearchLength`. To clear results below the threshold, use `onSearchValueChange`.
	 */
	onSearch?: (value: string) => void
	debounceMs?: number

	/** Offers an inline create row when nothing matches. Needs `onCreate` to do anything. */
	creatable?: boolean
	onCreate?: (value: string) => void

	/** Returns a group name per item. Absent means no grouping. */
	getItemGroup?: (item: T) => string
	renderGroupLabel?: (group: string) => ReactNode

	/** Enables scroll-triggered pagination. */
	hasMore?: boolean
	onLoadMore?: () => void
	loadingMore?: boolean

	/** Renders an option unselectable without hiding it. */
	getItemDisabled?: (item: T) => boolean

	/** Emphasises the matched substring. Ignored when `renderItem` is set. */
	highlightMatch?: boolean

	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export interface AsyncComboboxProps<T> extends AsyncComboboxSharedProps<T> {
	/** The selected item (not a key), or `null`. Controlled; survives `items` being replaced. */
	selectedValue: T | null
	onSelectedValueChange: (value: T | null) => void
	/** Clears the query when the popup closes. Defaults to `true`. */
	clearSearchOnClose?: boolean
}

export interface AsyncMultiComboboxProps<T> extends AsyncComboboxSharedProps<T> {
	/** The selections. Controlled; merged ahead of `items` and de-duplicated by key so they stay visible. */
	selectedValues: T[]
	/** With `applyButton`, this fires only on Apply. Without it, on every toggle. */
	onSelectedValuesChange: (values: T[]) => void
	/** Defaults to false. In apply mode the list stays open until Apply or Cancel. */
	closeOnSelect?: boolean
	/** Renders an Apply / Cancel footer and holds edits in a draft until Apply. Without it every toggle commits. */
	applyButton?: boolean
	onApply?: () => void
	onCancel?: () => void
}

/* ── The self-fetching pickers ─────────────────────────────────────────────────────── */

/** What a custom option renderer is told about the row it is drawing. */
export interface ResourceComboboxOptionContext {
	query: string
	isSelected: boolean
}

export interface ResourceComboboxErrorContext {
	error: unknown
	/** The query that failed, so a retry asks the same question. */
	query: string
	retry: () => void
}
