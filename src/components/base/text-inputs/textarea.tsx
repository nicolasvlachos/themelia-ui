/**
 * Textarea — Input's surface and affordances (count, clear, loading, invalid) on a
 * multi-line field. Grows with `field-sizing: content`; without it, the explicit min-height
 * and the resize handle remain.
 */
import { CircleXIcon, Loader2Icon } from "lucide-react"
import * as React from "react"

import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import { defaultInputStrings, type InputStrings } from "./input.strings"
import styles from "./text-inputs.module.css"
import { useFieldValue } from "./use-field-value"

export interface TextareaProps extends Omit<React.ComponentProps<"textarea">, "onChange"> {
	/** Overrides the character-count and clear copy. */
	strings?: StringsProp<InputStrings>
	/** Character cap, also the denominator of the count. */
	maxLength?: number
	/** Shows the current and maximum character count. */
	showCharacterCount?: boolean
	/** Shows an inline clear action once the field has a value. */
	clearable?: boolean
	onClear?: () => void
	/** Replaces the trailing affordance with a loading indicator. */
	loading?: boolean
	/** Applies the invalid styling. Validation copy stays with FormField. */
	invalid?: boolean
	/** Smallest height, in rows. */
	minRows?: number
	/** Height at which the field stops growing and starts scrolling. */
	maxRows?: number
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
	value?: string
	defaultValue?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{
		className, strings, maxLength, showCharacterCount, clearable, onClear, loading,
		invalid, minRows, maxRows, value, defaultValue, onChange, id, rows, style, ...props
	},
	ref,
) {
	const copy = { ...defaultInputStrings, ...strings }
	const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

	const floorRows = minRows ?? rows
	const field = useFieldValue({
		controlledValue: value,
		defaultValue,
		maxLength,
		showCharacterCount,
		providedId: id,
		idPrefix: "textarea",
	})

	const setRefs = React.useCallback(
		(node: HTMLTextAreaElement | null) => {
			innerRef.current = node
			if (typeof ref === "function") ref(node)
			else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
		},
		[ref],
	)

	// Via the native value setter, so React's change tracker sees the write.
	const handleClear = () => {
		if (props.disabled || props.readOnly) return
		const node = innerRef.current
		if (node) {
			const setter = Object.getOwnPropertyDescriptor(
				window.HTMLTextAreaElement.prototype, "value",
			)?.set
			setter?.call(node, "")
			node.dispatchEvent(new Event("input", { bubbles: true }))
			node.focus()
		}
		field.clearValue()
		onClear?.()
	}

	const showClear = clearable && field.value.length > 0
	/* One trailing affordance at a time, in the order that matters most. Same as Input. */
	const trailing = loading ? "loading" : showClear ? "clear" : field.showCount ? "count" : null
	/* At the limit, as Input: `maxLength` stops the count from ever passing it. */
	const atLimit = field.hasCharacterLimit && field.characterCount >= (maxLength as number)

	return (
		<span
			/* As in Input: `className` goes to the control; the frame is addressed by this slot. */
			data-slot="textarea-frame"
			className={styles.textareaFrame}
			data-field-shell=""
			data-invalid={invalid ? "" : undefined}
			data-trailing={trailing ?? undefined}
		>
			<textarea
				{...props}
				ref={setRefs}
				id={field.id}
				rows={rows ?? minRows}
				maxLength={maxLength}
				/* Keeps a caller's (or FormField's) `aria-invalid`, as Input does. */
				aria-invalid={invalid || props["aria-invalid"] || undefined}
				data-slot="textarea"
				data-field-control=""
				className={cx("textarea--component", styles.textarea, className)}
				style={{
					/*
					 * Row bounds in `lh` plus the textarea's block padding and border (keep in step
					 * with `.textarea`). `rows` is the floor without minRows: `field-sizing` ignores it.
					 */
					...(floorRows ? { minHeight: `calc(${floorRows}lh + var(--space-md) * 2 + var(--border-width) * 2)` } : null),
					...(maxRows ? { maxHeight: `calc(${maxRows}lh + var(--space-md) * 2 + var(--border-width) * 2)` } : null),
					...style,
				}}
				value={value !== undefined ? field.value : undefined}
				defaultValue={value === undefined ? defaultValue : undefined}
				onChange={(event) => {
					field.updateValue(event.target.value)
					onChange?.(event)
				}}
			/>

			{!!trailing && (
				<span className={cx(styles.affordance, styles.affordanceTextareaEnd)}>
					{trailing === "loading" && <Loader2Icon aria-hidden className={styles.spinner} />}
					{trailing === "clear" && (
						<button type="button" data-hit-area className={styles.clear} aria-label={copy.clear} disabled={props.disabled || props.readOnly} onClick={handleClear}>
							<CircleXIcon aria-hidden />
						</button>
					)}
					{trailing === "count" && (
						<span
							className={cx(styles.count, atLimit && styles.countOver)}
							aria-label={copy.characterCount(field.characterCount, maxLength as number)}
						>
							{field.characterCount} / {maxLength}
						</span>
					)}
				</span>
			)}
		</span>
	)
})
