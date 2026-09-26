/** StringRepeater — an ordered list of plain strings (alternate names, allowed domains). */
import { useCallback, useId } from "react"

import { Input } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import { defaultRepeaterStrings, type RepeaterStrings } from "./repeaters.strings"
import { Repeater } from "./repeater"

export interface StringRepeaterProps {
	value: string[]
	onValueChange: (value: string[]) => void
	placeholder?: string
	/** Overrides this list's own copy — the add control and each row's remove. */
	strings?: Partial<RepeaterStrings>
	emptyState?: React.ReactNode
	maxItems?: number
	sortable?: boolean
	disabled?: boolean
	invalid?: boolean
	className?: string
	"aria-label"?: string
}

export function StringRepeater({
	value,
	onValueChange,
	placeholder,
	strings,
	emptyState,
	maxItems,
	sortable = false,
	disabled = false,
	invalid = false,
	className,
	"aria-label": ariaLabel,
}: StringRepeaterProps) {
	const copy = { ...defaultRepeaterStrings, ...strings }
	const id = useId()

	const setAt = useCallback(
		(index: number, next: string) => onValueChange(value.map((entry, position) => (position === index ? next : entry))),
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

	return (
		<Repeater
			items={value}
			/* Index-based: values are neither unique nor stable, and a content key would remount on every keystroke. */
			getKey={(_, index) => `${id}-${index}`}
			onAdd={() => onValueChange([...value, ""])}
			onRemove={(index) => onValueChange(value.filter((_, position) => position !== index))}
			onMove={sortable ? move : undefined}
			strings={copy}
			emptyState={emptyState}
			maxItems={maxItems}
			disabled={disabled}
			className={cx("string-repeater--component", className)}
		>
			{(entry, { index }) => (
				<Input
					value={entry}
					placeholder={placeholder}
					disabled={disabled}
					aria-invalid={invalid || undefined}
					aria-label={ariaLabel ? `${ariaLabel} ${index + 1}` : undefined}
					onChange={(event) => setAt(index, event.target.value)}
				/>
			)}
		</Repeater>
	)
}
