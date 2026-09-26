/**
 * KeyValueEditor — a list of key/value pairs, not an object, so a half-typed or blank key
 * keeps its row. Convert to an object on submit.
 */
import { useCallback, useId } from "react"

import { Input } from "@/components/base/text-inputs"
import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import { defaultKeyValueEditorStrings, type KeyValueEditorStrings } from "./repeaters.strings"
import { Repeater } from "./repeater"

export interface KeyValuePair {
	key: string
	value: string
}

export interface KeyValueEditorProps {
	value: KeyValuePair[]
	onValueChange: (value: KeyValuePair[]) => void
	/** Overrides this editor's own copy — the two placeholders, add, and remove. */
	strings?: Partial<KeyValueEditorStrings>
	emptyState?: React.ReactNode
	maxItems?: number
	sortable?: boolean
	disabled?: boolean
	invalid?: boolean
	/** Flags a key that is already used elsewhere in the list. */
	flagDuplicateKeys?: boolean
	className?: string
}

export function KeyValueEditor({
	value,
	onValueChange,
	strings,
	emptyState,
	maxItems,
	sortable = false,
	disabled = false,
	invalid = false,
	flagDuplicateKeys = true,
	className,
}: KeyValueEditorProps) {
	const copy = { ...defaultKeyValueEditorStrings, ...strings }
	const id = useId()

	const setAt = useCallback(
		(index: number, patch: Partial<KeyValuePair>) =>
			onValueChange(value.map((pair, position) => (position === index ? { ...pair, ...patch } : pair))),
		[onValueChange, value],
	)

	const move = useCallback(
		(from: number, to: number) => {
			const next = [...value]
			const [moved] = next.splice(from, 1)
			if (moved === undefined) return
			next.splice(to, 0, moved)
			onValueChange(next)
		},
		[onValueChange, value],
	)

	/** A blank key is an unfinished row, not a duplicate. */
	const isDuplicate = (pair: KeyValuePair, index: number) =>
		flagDuplicateKeys &&
		pair.key.trim() !== "" &&
		value.some((other, position) => position !== index && other.key.trim() === pair.key.trim())

	return (
		<Repeater
			items={value}
			getKey={(_, index) => `${id}-${index}`}
			onAdd={() => onValueChange([...value, { key: "", value: "" }])}
			onRemove={(index) => onValueChange(value.filter((_, position) => position !== index))}
			onMove={sortable ? move : undefined}
			strings={copy}
			emptyState={emptyState}
			maxItems={maxItems}
			disabled={disabled}
			className={cx("key-value-editor--component", className)}
		>
			{(pair, { index }) => (
				<Stack direction="horizontal" gap="sm" wrap={false}>
					<Input
						value={pair.key}
						placeholder={copy.keyPlaceholder}
						disabled={disabled}
						aria-invalid={invalid || isDuplicate(pair, index) || undefined}
						aria-label={copy.keyLabel(index + 1)}
						onChange={(event) => setAt(index, { key: event.target.value })}
					/>
					<Input
						value={pair.value}
						placeholder={copy.valuePlaceholder}
						disabled={disabled}
						aria-invalid={invalid || undefined}
						aria-label={copy.valueLabel(index + 1)}
						onChange={(event) => setAt(index, { value: event.target.value })}
					/>
				</Stack>
			)}
		</Repeater>
	)
}
