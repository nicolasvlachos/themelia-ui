/**
 * The bodies of the filter editors — one per type, behind one popover.
 *
 * Multi-selects stage their value and commit on Apply (one request, not one per tick); a
 * single select with `closeOnSelect` commits immediately. The footer appears only once the
 * staged value differs. Select and async select share one staging editor
 * (`OptionListEditor`) and differ only in where options come from.
 */
import { ArrowLeftIcon } from "lucide-react"
import { format, isValid, parse } from "date-fns"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/base/buttons"
import { Input } from "@/components/base/text-inputs"
import { RangeDatePicker, SingleDatePicker } from "@/components/base/date-pickers"
import { PopoverMenuPanel, type PopoverMenuPanelProps } from "@/components/base/popover-menu"
import { TagsInput } from "@/components/base/value-inputs"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { useFilters } from "./filter-store"
import { useAsyncOptions } from "./use-async-options"
import {
	FilterOperator, FilterType, type FilterConfig, type FilterOption, type FilterTriggerSource,
} from "./filters.types"
import styles from "./filters.module.css"
import { useSyncedState } from "@/hooks/use-synced-state"
import { useIsMobile } from "@/hooks/use-mobile"

const ISO_DATE = "yyyy-MM-dd"

export interface FilterEditorProps {
	filter: FilterConfig
	value: string[]
	onValueChange: (value: string[]) => void
	onBack: () => void
	onClose: () => void
	/** Only a toolbar-opened editor has a list to go back to. */
	triggerSource?: FilterTriggerSource
}

function EditorHeader({
	filter,
	showBack,
	onBack,
}: {
	filter: FilterConfig
	showBack: boolean
	onBack: () => void
}) {
	const { strings } = useFilters()

	return (
		<div className={styles.editorHeader}>
			{showBack && (
				<Button
					type="button"
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					onClick={onBack}
					aria-label={strings.backToFilters}
				>
					<ArrowLeftIcon />
				</Button>
			)}
			<Text tag="span" weight="semibold" truncate>{filter.label}</Text>
		</div>
	)
}

function EditorFooter({
	count,
	filter,
	onApply,
}: {
	count: number
	filter: FilterConfig
	onApply: () => void
}) {
	const { strings } = useFilters()

	return (
		<div className={styles.editorFooter}>
			{/* Not `numeric`, which would switch the sentence to the mono family. */}
			<Text size="xs" type="secondary">
				{strings.selected(
					count,
					((count === 1 ? filter.label : (filter.pluralLabel ?? filter.label)) ?? "").toLowerCase(),
				)}
			</Text>
			<Button type="button" onClick={onApply}>{strings.confirm}</Button>
		</div>
	)
}

/** The same set-toggle every option list needs. */
function toggle(values: string[], entry: string): string[] {
	return values.includes(entry) ? values.filter((value) => value !== entry) : [...values, entry]
}

function sameSet(left: string[], right: string[]): boolean {
	return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
}

/** What each editor adds to the shared one: how its options are searched, and their state. */
type OptionSource = Pick<
	PopoverMenuPanelProps,
	"search" | "searchValue" | "onSearchChange" | "minSearchLength" | "loading" | "error" | "onRetry"
>

/** The staging editor behind SelectFilterEditor and AsyncFilterEditor. `hook` keeps each editor's own DOM class. */
function OptionListEditor({
	filter, value, onValueChange, onBack, onClose, triggerSource = "chip",
	hook, options, multiple, source,
}: FilterEditorProps & {
	hook: string
	options: readonly FilterOption[]
	multiple: boolean
	source: OptionSource
}) {
	const { strings, reportError } = useFilters()
	const [staged, setStaged] = useSyncedState<string[]>(value)
	const dirty = !sameSet(staged, value)

	/* Every commit goes through here, so a throwing `onValueChange` always reaches `onError`. */
	const commit = (next: string[]) => {
		try {
			onValueChange(next)
			onClose()
		} catch (error) {
			reportError(error, { phase: "apply", filterKey: filter.key })
		}
	}

	/* Local search matches the label; remote search is the server's, and rows keep their value as identity. */
	const matchLabel = !source.onSearchChange

	return (
		<div className={cx(hook, styles.editor)}>
			<EditorHeader filter={filter} showBack={triggerSource === "toolbar"} onBack={onBack} />

			<PopoverMenuPanel
				{...source}
				label={filter.label}
				items={options.map((option) => ({
					value: option.value,
					label: option.label,
					description: option.description || undefined,
					icon: option.icon,
					disabled: option.disabled,
					selected: staged.includes(option.value),
					searchValue: matchLabel ? option.label : undefined,
				}))}
				onSelect={({ value: picked }) => {
					if (!multiple) {
						setStaged([picked])
						if (filter.closeOnSelect) commit([picked])
						return
					}
					setStaged((current) => toggle(current, picked))
				}}
				strings={{
					searchPlaceholder: strings.searchPlaceholder(filter.label.toLowerCase()),
					empty: strings.noOptionsFound,
					loading: strings.searching,
					error: strings.fetchError,
					retry: strings.retryFetch,
					formatTypeToSearch: strings.minQueryHint,
				}}
			/>

			{dirty && <EditorFooter count={staged.length} filter={filter} onApply={() => commit(staged)} />}
		</div>
	)
}

export function SelectFilterEditor(props: FilterEditorProps) {
	const options = props.filter.options ?? []

	return (
		<OptionListEditor
			{...props}
			hook="select-filter-editor--component"
			options={options}
			multiple={props.filter.multiple === true || props.filter.type === FilterType.MULTI_SELECT}
			/* The search box is worth its own row only when the list is long enough to need it. */
			source={{ search: options.length > 5 }}
		/>
	)
}

export function AsyncFilterEditor(props: FilterEditorProps) {
	const { filter } = props
	const { cacheAsyncOptions, reportError } = useFilters()
	const [search, setSearch] = useState("")

	const async_ = useAsyncOptions(filter, search, true, { onError: reportError })

	/* Remember resolved labels so the pill can name its value after the popover closes. */
	useEffect(() => {
		if (async_.options.length > 0) cacheAsyncOptions(filter.key, async_.options)
	}, [async_.options, cacheAsyncOptions, filter.key])

	return (
		<OptionListEditor
			{...props}
			hook="async-filter-editor--component"
			options={async_.options}
			multiple={filter.multiple === true}
			/* The server filters; the list holds only matches. */
			source={{
				searchValue: search,
				onSearchChange: setSearch,
				minSearchLength: async_.minQueryLength,
				loading: async_.isLoading,
				error: async_.isError,
				onRetry: async_.refetch,
			}}
		/>
	)
}

export function DateFilterEditor({
	filter, value, onValueChange, onBack, triggerSource = "chip",
}: FilterEditorProps) {
	const isMobile = useIsMobile()
	const { isNavigating } = useFilters()
	const pattern = filter.dateFormat?.param ?? ISO_DATE

	const parseValue = (raw?: string) => {
		if (!raw) return undefined
		const parsed = parse(raw, pattern, new Date())
		return isValid(parsed) ? parsed : undefined
	}

	const write = (date?: Date) => (date && isValid(date) ? format(date, pattern) : undefined)

	const isRange = filter.operator === FilterOperator.BETWEEN

	return (
		<div className={cx("date-filter-editor--component", styles.editor)}>
			<EditorHeader filter={filter} showBack={triggerSource === "toolbar"} onBack={onBack} />
			<div className={styles.editorBody}>
				{isRange ? (
					<RangeDatePicker
						disabled={isNavigating}
						numberOfMonths={isMobile ? 1 : 2}
						value={{ from: parseValue(value[0]), to: parseValue(value[1]) }}
						onValueChange={(next) => {
							const from = write(next?.from)
							const to = write(next?.to)
							// A half-picked range is valid; never write `undefined` into the URL.
							onValueChange([from, to].filter((entry): entry is string => !!entry))
						}}
					/>
				) : (
					<SingleDatePicker
						disabled={isNavigating}
						value={parseValue(value[0])}
						onValueChange={(next) => {
							const written = write(next)
							onValueChange(written ? [written] : [])
						}}
					/>
				)}
			</div>
		</div>
	)
}

export function TagsFilterEditor({
	filter, value, onValueChange, onBack, onClose, triggerSource = "chip",
}: FilterEditorProps) {
	const { strings } = useFilters()
	const [staged, setStaged] = useSyncedState<string[]>(value)

	const dirty = !sameSet(staged, value)

	return (
		<div className={cx("tags-filter-editor--component", styles.editor)}>
			<EditorHeader filter={filter} showBack={triggerSource === "toolbar"} onBack={onBack} />
			<div className={styles.editorBody}>
				<TagsInput
					value={staged}
					onValueChange={setStaged}
					placeholder={filter.placeholder ?? strings.enterTags}
					maxTags={filter.maxSelected}
				/>
			</div>
			{dirty && (
				<EditorFooter
					count={staged.length}
					filter={filter}
					onApply={() => {
						onValueChange(staged)
						onClose()
					}}
				/>
			)}
		</div>
	)
}

export function RangeFilterEditor({
	filter, value, onValueChange, onBack, onClose, triggerSource = "chip",
}: FilterEditorProps) {
	const { strings } = useFilters()
	const [bounds, setBounds] = useSyncedState(value)
	const [min, max] = [bounds[0] ?? "", bounds[1] ?? ""]
	const setMin = (next: string) => setBounds([next, bounds[1] ?? ""])
	const setMax = (next: string) => setBounds([bounds[0] ?? "", next])

	const between = filter.operator === FilterOperator.BETWEEN
	const next = useMemo(
		() => (between ? [min, max] : [min]).filter((entry) => entry.trim().length > 0),
		[between, max, min],
	)
	const dirty = !sameSet(next, value)

	return (
		<div className={styles.editor}>
			<EditorHeader filter={filter} showBack={triggerSource === "toolbar"} onBack={onBack} />
			<div className={cx("range-filter-editor--component", styles.editorBody, styles.rangeBody)}>
				<Input
					type="number"
					value={min}
					onChange={(event) => setMin(event.target.value)}
					placeholder={strings.min}
					aria-label={strings.min}
				/>
				{between && (
					<Input
						type="number"
						value={max}
						onChange={(event) => setMax(event.target.value)}
						placeholder={strings.max}
						aria-label={strings.max}
					/>
				)}
			</div>
			{dirty && (
				<EditorFooter
					count={next.length}
					filter={filter}
					onApply={() => {
						onValueChange(next)
						onClose()
					}}
				/>
			)}
		</div>
	)
}

/** Dispatches on the filter's type. One place that knows which editor a type gets. */
export function FilterEditor(props: FilterEditorProps) {
	const { getFilterOperator } = useFilters()
	const editorProps = { ...props, filter: { ...props.filter, operator: getFilterOperator(props.filter.key) } }
	switch (props.filter.type) {
		case FilterType.DATE:
			return <DateFilterEditor {...editorProps} />
		case FilterType.TAGS:
			return <TagsFilterEditor {...editorProps} />
		case FilterType.RANGE:
			return <RangeFilterEditor {...editorProps} />
		case FilterType.ASYNC_SELECT:
			return <AsyncFilterEditor {...editorProps} />
		default:
			return <SelectFilterEditor {...editorProps} />
	}
}
