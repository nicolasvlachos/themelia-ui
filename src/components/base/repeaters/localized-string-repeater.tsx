/**
 * LocalizedStringRepeater — an ordered list of localized strings (`{ en: "…", nl: "…" }`),
 * each row a `LocalizedStringField`.
 */
import { useCallback, useId } from "react"
import { cx } from "@/lib/cx"

import { defaultRepeaterStrings, type RepeaterStrings } from "./repeaters.strings"
import { Repeater } from "./repeater"
import {
	LocalizedStringField, type LocaleDescriptor, type LocalizedValue,
} from "./localized-fields"

export interface LocalizedStringRepeaterProps {
	locales: (string | LocaleDescriptor)[]
	value: LocalizedValue[]
	onValueChange: (value: LocalizedValue[]) => void
	placeholder?: string
	/** Overrides this list's own copy — the add control and each row's remove. */
	strings?: Partial<RepeaterStrings>
	emptyState?: React.ReactNode
	maxItems?: number
	sortable?: boolean
	multiline?: boolean
	requiredLocales?: string[]
	disabled?: boolean
	invalid?: boolean
	className?: string
	"aria-label"?: string
}

export function LocalizedStringRepeater({
	locales,
	value,
	onValueChange,
	placeholder,
	strings,
	emptyState,
	maxItems,
	sortable = false,
	multiline = false,
	requiredLocales,
	disabled = false,
	invalid = false,
	className,
	"aria-label": ariaLabel,
}: LocalizedStringRepeaterProps) {
	const copy = { ...defaultRepeaterStrings, ...strings }
	const id = useId()

	const setAt = useCallback(
		(index: number, next: LocalizedValue) =>
			onValueChange(value.map((entry, position) => (position === index ? next : entry))),
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
			/* Index-based: no stable field to key on, and a content key would remount on every keystroke. */
			getKey={(_, index) => `${id}-${index}`}
			onAdd={() => onValueChange([...value, {}])}
			onRemove={(index) => onValueChange(value.filter((_, position) => position !== index))}
			onMove={sortable ? move : undefined}
			rowVariant="card"
			strings={copy}
			emptyState={emptyState}
			maxItems={maxItems}
			disabled={disabled}
			className={cx("localized-string-repeater--component", className)}
		>
			{(entry, { index }) => (
				<LocalizedStringField
					locales={locales}
					value={entry}
					onValueChange={(next) => setAt(index, next)}
					multiline={multiline}
					placeholder={placeholder}
					requiredLocales={requiredLocales}
					disabled={disabled}
					invalid={invalid}
					aria-label={ariaLabel ? `${ariaLabel} ${index + 1}` : undefined}
				/>
			)}
		</Repeater>
	)
}
