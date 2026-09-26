/**
 * AsyncCombobox and AsyncMultiCombobox — the search-driven pickers.
 *
 * The single-select input shows the query while open and the selection's label while
 * closed. Selections are held as items, not keys, because the next result set may not
 * contain them. Shared wiring lives in `useAsyncComboboxWiring`.
 */
import { useCallback, useId, useMemo, useRef, useState } from "react"

import {
	ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxInputTrigger, ComboboxRoot,
	defaultComboboxStrings,
} from "@/components/base/combobox"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { ComboboxDropdown, type ComboboxDropdownProps } from "./combobox-dropdown"
import {
	DEFAULT_MIN_SEARCH_LENGTH, getCreateOptionValue, isCreateOption, useComboboxCore,
} from "./use-combobox-core"
import type {
	AsyncComboboxProps, AsyncComboboxSharedProps, AsyncMultiComboboxProps,
} from "./combobox.types"
import styles from "./combobox.module.css"

function FieldError({ error, id }: { error?: string; id: string }) {
	if (!error) return null
	return (
		<Text id={id} tag="p" size="xs" type="error" role="alert" aria-live="polite" className={styles.error}>
			{error}
		</Text>
	)
}

/** The wiring both variants share: item plumbing, query echo, popup props, validation message. */
function useAsyncComboboxWiring<T>(props: AsyncComboboxSharedProps<T>, ensuredItems: T[]) {
	const {
		onSearchValueChange, loading = false, showListContent = true,
		minSearchLength = DEFAULT_MIN_SEARCH_LENGTH, loadingMore, getItemDisabled,
		renderGroupLabel, portalContainer, invalid, error, disabled, name, required,
	} = props
	const core = useComboboxCore({ ...props, ensuredItems })
	const errorId = useId()
	const { getItemReactKey } = core

	const onInputValueChange = useCallback(
		(value: string, { reason }: { reason: string }) => {
			// A press commits a value; do not echo its label back as a query.
			onSearchValueChange(reason === "item-press" ? "" : value)
		},
		[onSearchValueChange],
	)

	const isItemEqualToValue = useCallback(
		(a: T, b: T) => getItemReactKey(a) === getItemReactKey(b),
		[getItemReactKey],
	)

	const dropdown: ComboboxDropdownProps<T> = {
		loading,
		showStatus: core.showStatus,
		showEmpty: core.showEmpty,
		trimmedSearch: core.trimmedSearch,
		minSearchLength,
		items: core.allItems,
		groupedItems: core.groupedItems,
		createOptionItem: core.createOptionItem,
		renderItemContent: core.renderItemContent,
		getItemReactKey,
		getItemDisabled,
		renderGroupLabel,
		// The pager belongs to a result list, not to a status row standing in for one.
		loadingMore: showListContent && !core.showStatus ? loadingMore : false,
		strings: core.strings,
		portalContainer,
		listRef: core.listRef,
	}

	return {
		core,
		dropdown,
		root: {
			items: core.allItems,
			itemToStringLabel: core.itemToStringLabel,
			isItemEqualToValue,
			// Never filters `items` (see the props type).
			filter: null,
			onInputValueChange,
			disabled,
			name,
			required,
		},
		invalid: invalid || !!error,
		errorId,
		describedBy: error ? errorId : undefined,
	}
}

export function AsyncCombobox<T>({
	selectedValue,
	onSelectedValueChange,
	clearSearchOnClose = true,
	minSearchLength = DEFAULT_MIN_SEARCH_LENGTH,
	loading = false,
	showListContent = true,
	disabled = false,
	clearable = true,
	...shared
}: AsyncComboboxProps<T>) {
	const { id, searchValue, onSearchValueChange, className, error, required, onBlur, onCreate, open, onOpenChange } = shared

	// So the selection survives a result set that no longer contains it.
	const ensured = useMemo(() => (selectedValue ? [selectedValue] : []), [selectedValue])
	const { core, dropdown, root, invalid, errorId, describedBy } = useAsyncComboboxWiring(
		{ ...shared, minSearchLength, loading, showListContent, disabled },
		ensured,
	)

	const [isOpen, setIsOpen] = useState(false)

	const handleOpenChange = useCallback(
		(next: boolean) => {
			setIsOpen(next)
			if (!next && clearSearchOnClose) onSearchValueChange("")
			onOpenChange?.(next)
		},
		[clearSearchOnClose, onOpenChange, onSearchValueChange],
	)

	// The query while open, the selection's label while closed.
	const inputValue = (open ?? isOpen) ? searchValue : selectedValue ? core.itemToStringLabel(selectedValue) : ""

	const handleValueChange = useCallback(
		(value: T | null) => {
			/* The create row arrives as a selection; intercept it — the consumer creates and decides what to select. */
			if (value && isCreateOption(value)) {
				onCreate?.(getCreateOptionValue(value))
				return
			}
			onSelectedValueChange(value)
		},
		[onCreate, onSelectedValueChange],
	)

	return (
		<div className={cx("async-combobox--component", styles.root)}>
			<ComboboxRoot
				{...root}
				value={selectedValue}
				onValueChange={handleValueChange}
				inputValue={inputValue}
				open={open}
				onOpenChange={handleOpenChange}
			>
				<ComboboxInputTrigger
					id={id}
					placeholder={core.strings.placeholder}
					showClear={clearable}
					invalid={invalid}
					aria-describedby={describedBy}
					aria-required={required}
					disabled={disabled}
					onBlur={onBlur}
					className={className}
					strings={{ clear: core.strings.clear, toggle: core.strings.toggle }}
				/>

				<ComboboxDropdown {...dropdown} />
			</ComboboxRoot>

			<FieldError error={error} id={errorId} />
		</div>
	)
}

export function AsyncMultiCombobox<T>({
	selectedValues,
	onSelectedValuesChange,
	minSearchLength = DEFAULT_MIN_SEARCH_LENGTH,
	loading = false,
	showListContent = true,
	disabled = false,
	closeOnSelect = false,
	applyButton = false,
	onApply,
	onCancel,
	open,
	onOpenChange,
	...shared
}: AsyncMultiComboboxProps<T>) {
	/*
	 * Chip labels come from `core`, not `shared.getItemLabel`: calling a function off the rest
	 * object during render makes the React Compiler drop the memos below. Same for `open`/`onOpenChange`.
	 */
	const { id, searchValue, className, error, required, onBlur, onCreate } = shared
	const anchor = useRef<HTMLDivElement | null>(null)

	/* Apply mode only: edits accumulate until Apply; Cancel or dismissal restores the committed set. */
	const [draft, setDraft] = useState<T[]>(selectedValues)
	const [internalOpen, setInternalOpen] = useState(false)
	const isOpenControlled = open !== undefined
	const resolvedOpen = isOpenControlled ? open : internalOpen

	/* Re-seed the draft from the committed selection during render, so checkmarks never lag a frame. */
	const [seededFrom, setSeededFrom] = useState(selectedValues)
	if (applyButton && selectedValues !== seededFrom) {
		setSeededFrom(selectedValues)
		setDraft(selectedValues)
	}

	const [previousOpen, setPreviousOpen] = useState(resolvedOpen)
	if (previousOpen !== resolvedOpen) {
		setPreviousOpen(resolvedOpen)
		if (!resolvedOpen && applyButton) setDraft(selectedValues)
	}

	const visible = applyButton ? draft : selectedValues
	const { core, dropdown, root, invalid, errorId, describedBy } = useAsyncComboboxWiring(
		{ ...shared, open, onOpenChange, minSearchLength, loading, showListContent, disabled },
		visible,
	)
	const removeChip = core.strings.removeChip ?? defaultComboboxStrings.removeChip

	const setOpen = useCallback(
		(next: boolean) => {
			if (!isOpenControlled) setInternalOpen(next)
			onOpenChange?.(next)
		},
		[isOpenControlled, onOpenChange],
	)

	const handleValueChange = useCallback(
		(values: T[]) => {
			/* A create row inside the array is pulled out and reported separately. */
			const regular: T[] = []
			let created: string | null = null
			for (const value of values) {
				if (isCreateOption(value)) created = getCreateOptionValue(value)
				else regular.push(value)
			}

			if (created !== null) onCreate?.(created)
			else if (applyButton) setDraft(regular)
			else onSelectedValuesChange(regular)

			if (closeOnSelect && !applyButton) setOpen(false)
		},
		[applyButton, closeOnSelect, onCreate, onSelectedValuesChange, setOpen],
	)

	const handleApply = useCallback(() => {
		if (applyButton) onSelectedValuesChange(draft)
		onApply?.()
		setOpen(false)
	}, [applyButton, draft, onApply, onSelectedValuesChange, setOpen])

	const handleCancel = useCallback(() => {
		if (applyButton) setDraft(selectedValues)
		onCancel?.()
		setOpen(false)
	}, [applyButton, onCancel, selectedValues, setOpen])

	return (
		<div className={cx("async-multi-combobox--component", styles.root)}>
			<ComboboxRoot
				{...root}
				multiple
				value={visible}
				onValueChange={handleValueChange}
				inputValue={searchValue}
				open={resolvedOpen}
				onOpenChange={(next) => {
					// Dismissing is not applying, so the draft goes back to the committed set.
					if (!next && applyButton) setDraft(selectedValues)
					setOpen(next)
				}}
			>
				<ComboboxChips ref={anchor} invalid={invalid} className={className}>
					{visible.map((item) => (
						/* Plain-text label, so the remove control is named after the chip. */
						<ComboboxChip key={core.getKey(item)} strings={{ removeChip }}>
							{core.itemToStringLabel(item)}
						</ComboboxChip>
					))}
					<ComboboxChipsInput
						id={id}
						// The placeholder would sit beside the chips and read as another one.
						placeholder={visible.length > 0 ? undefined : core.strings.placeholder}
						aria-invalid={invalid || undefined}
						aria-describedby={describedBy}
						aria-required={required}
						onBlur={onBlur}
					/>
				</ComboboxChips>

				<ComboboxDropdown
					{...dropdown}
					// The chips row, not the input inside it — the popup spans the whole field.
					anchor={anchor}
					applyFooter={
						showListContent && applyButton
							? {
									applyLabel: core.strings.apply,
									cancelLabel: core.strings.cancel,
									onApply: handleApply,
									onCancel: handleCancel,
								}
							: undefined
					}
				/>
			</ComboboxRoot>

			<FieldError error={error} id={errorId} />
		</div>
	)
}
