/**
 * Input — the text field on the shared surface (`data-field-control`, styles/fields.css),
 * plus inline lanes: leading icon or prefix, and one trailing affordance at a time.
 */
import { CircleXIcon, Loader2Icon } from "lucide-react"
import * as React from "react"

import { textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import { defaultInputStrings, type InputStrings } from "./input.strings"
import styles from "./text-inputs.module.css"
import { useFieldValue } from "./use-field-value"

/** A Lucide icon, any component taking a className, or an already-rendered node. */
export type FieldIcon = React.ComponentType<{ className?: string }> | React.ReactNode

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
	/** Glyph before the value, in its own lane so the text never runs under it. */
	startIcon?: FieldIcon
	/** Glyph after the value, in its own lane so the text never runs under it. */
	endIcon?: FieldIcon
	/**
	 * Short text attached before the value, outside the text itself — a currency symbol, a
	 * protocol, an at sign.
	 */
	startAddon?: React.ReactNode
	/** Short text attached after the value, outside the text itself — a unit, a domain. */
	endAddon?: React.ReactNode
	/** Shows "12 / 80" in the trailing lane. Requires `maxLength`. */
	showCharacterCount?: boolean
	/** Character cap, and the limit the count counts against. Input past it is refused. */
	maxLength?: number
	/**
	 * Shows a clear control once the field has a value. Clearing goes through the native
	 * value setter, so React's value tracker stays in sync.
	 */
	clearable?: boolean
	/** Called after the clear control empties the field. */
	onClear?: () => void
	/**
	 * Replaces the trailing affordance with a spinner, which outranks every other trailing
	 * affordance.
	 */
	loading?: boolean
	/**
	 * Applies the invalid treatment. Pair it with FormField's error for the message, so the
	 * border and the announcement cannot disagree.
	 */
	invalid?: boolean
	/**
	 * Includes string addons in the value reported by `onChange`. Off, because an addon is
	 * presentation: a caller that stores "$" and the number has to strip it again on the way
	 * out.
	 */
	returnValueWithAddons?: boolean
	/** Overrides this field's own copy — the clear label, the character-count format. */
	strings?: StringsProp<InputStrings>
}

/** Accepts a component or a rendered node, so `SearchIcon` and `<SearchIcon />` both work. */
function renderIcon(icon: FieldIcon | undefined): React.ReactNode {
	if (!icon) return null
	if (React.isValidElement(icon)) return icon
	if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
		const Icon = icon as React.ComponentType<{ "aria-hidden"?: boolean }>
		return <Icon aria-hidden />
	}
	return icon as React.ReactNode
}

function withAddons(value: string, start?: React.ReactNode, end?: React.ReactNode): string {
	if (!value) return value
	const prefix = typeof start === "string" ? start : ""
	const suffix = typeof end === "string" ? end : ""
	return `${prefix}${value}${suffix}`
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
	{
		className,
		type = "text",
		startIcon,
		endIcon,
		startAddon,
		endAddon,
		maxLength,
		showCharacterCount,
		clearable,
		onClear,
		loading = false,
		invalid,
		returnValueWithAddons = false,
		strings,
		value: controlledValue,
		defaultValue,
		onChange,
		id: providedId,
		...props
	},
	forwardedRef,
) {
	const copy = { ...defaultInputStrings, ...strings }
	const innerRef = React.useRef<HTMLInputElement>(null)

	const setRefs = React.useCallback(
		(node: HTMLInputElement | null) => {
			innerRef.current = node
			if (typeof forwardedRef === "function") forwardedRef(node)
			else if (forwardedRef) forwardedRef.current = node
		},
		[forwardedRef],
	)

	const field = useFieldValue({
		controlledValue: controlledValue as string | undefined,
		defaultValue: defaultValue as string | undefined,
		maxLength,
		showCharacterCount,
		providedId,
		idPrefix: "input",
	})

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = event.target.value
		// Refused rather than silently truncated.
		if (!field.updateValue(next)) return

		if (!onChange) return
		if (!returnValueWithAddons) {
			onChange(event)
			return
		}

		const decorated = withAddons(next, startAddon, endAddon)
		onChange({
			...event,
			target: { ...event.target, value: decorated },
			currentTarget: { ...event.currentTarget, value: decorated },
		} as React.ChangeEvent<HTMLInputElement>)
	}

	const handleClear = () => {
		if (props.disabled || props.readOnly) return
		field.clearValue()
		const node = innerRef.current
		if (node) {
			// Via the native setter, so React's value tracker stays in sync.
			const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
			setter?.call(node, "")
			onChange?.({
				target: node,
				currentTarget: node,
				type: "change",
			} as unknown as React.ChangeEvent<HTMLInputElement>)
		}
		onClear?.()
		// Keep focus in the field.
		innerRef.current?.focus()
	}

	// One trailing affordance at a time, most transient first: spinner, clear, count, icon, addon.
	const showClear = !!clearable && field.hasValue && !loading
	const trailing = loading
		? "loading"
		: showClear
			? "clear"
			: field.showCount
				? "count"
				: endIcon
					? "icon"
					: endAddon
						? "addon"
						: null

	const atLimit = field.hasCharacterLimit && field.characterCount >= (maxLength as number)

	return (
		<span
			/* `className` lands on the input; this slot addresses the frame. */
			data-slot="input-frame"
			className={styles.frame}
			data-start-icon={startIcon ? "" : undefined}
			data-start-addon={startAddon ? "" : undefined}
			data-end-icon={trailing === "icon" || trailing === "clear" || trailing === "loading" ? "" : undefined}
			data-end-addon={trailing === "addon" ? "" : undefined}
			data-count={trailing === "count" ? "" : undefined}
		>
			{(startIcon || startAddon) && (
				<span className={cx(styles.affordance, styles.affordanceStart)}>
					{renderIcon(startIcon)}
					{!!startAddon && <span className={styles.affordanceText}>{startAddon}</span>}
				</span>
			)}

			<input
				{...props}
				ref={setRefs}
				id={field.id}
				type={type}
				data-slot="input"
				data-field-control=""
				/* Keeps a caller's (or FormField's) `aria-invalid`; it drives both style and announcement. */
				aria-invalid={invalid || props["aria-invalid"] || undefined}
				maxLength={maxLength}
				value={controlledValue}
				defaultValue={defaultValue}
				onChange={handleChange}
				className={cx("input--component", className)}
			/>

			{trailing !== null && (
				<span className={cx(styles.affordance, styles.affordanceEnd)}>
					{trailing === "loading" && <Loader2Icon aria-hidden className={styles.spinner} />}
					{trailing === "clear" && (
						<button type="button" data-hit-area className={styles.clear} aria-label={copy.clear} disabled={props.disabled || props.readOnly} onClick={handleClear}>
							<CircleXIcon aria-hidden />
						</button>
					)}
					{trailing === "count" && (
						<span
							className={cx(styles.count, textClassName({ size: "xs", numeric: true, type: atLimit ? "error" : "secondary" }))}
							aria-label={copy.characterCount(field.characterCount, maxLength as number)}
						>
							{field.characterCount} / {maxLength}
						</span>
					)}
					{trailing === "icon" && renderIcon(endIcon)}
					{trailing === "addon" && <span className={styles.affordanceText}>{endAddon}</span>}
				</span>
			)}
		</span>
	)
})
