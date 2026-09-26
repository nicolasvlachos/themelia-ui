/**
 * Select — the canonical finite-option control. One Base UI engine behind plain and
 * descriptive options. The trigger carries `data-field-control` (styles/fields.css).
 */
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDownIcon } from "lucide-react"
import { forwardRef, useCallback, useMemo, type FocusEventHandler, type ReactNode, type Ref } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultSelectStrings, type SelectStrings } from "./select.strings"
import styles from "./select.module.css"
import {
	SelectPopupContent, SelectPopupGroup, SelectPopupItem, type SelectPopupContentProps,
} from "./select-popup"

export interface SelectOption {
	value: string
	label: string
	/** Second line under the label. Clamped to two lines. */
	description?: string
	icon?: ReactNode
	disabled?: boolean
}

export interface SelectProps {
	options: SelectOption[]
	/** Shorthand for `strings.placeholder`. */
	placeholder?: string
	/** Overrides this select's own copy — the placeholder and the clear row. */
	strings?: Partial<SelectStrings>
	/** Prepends an option that clears the selection. */
	allowClear?: boolean
	/** Applies the invalid treatment. Pair it with a message on the FormField. */
	invalid?: boolean

	/** Controlled value. Passing `undefined` explicitly keeps it controlled and clear. */
	value?: string | null
	defaultValue?: string | null
	/** Fires with `undefined` when the selection is cleared. */
	onValueChange?: (value: string | undefined) => void

	disabled?: boolean
	readOnly?: boolean
	required?: boolean
	/** Field name for the hidden native input. */
	name?: string
	/** The owning form's id, when the select renders outside it. */
	form?: string
	autoComplete?: string
	/** Ref to the hidden native input used for submission. */
	inputRef?: Ref<HTMLInputElement>
	id?: string

	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	/** Isolates interaction with the rest of the page while open. */
	modal?: boolean
	/** Pointer movement highlights options. */
	highlightItemOnHover?: boolean
	/** Where the popup opens relative to the trigger. */
	side?: SelectPopupContentProps["side"]
	align?: SelectPopupContentProps["align"]
	/**
	 * Positions the selected option over the trigger, macOS-style. Off by default: inside
	 * a form it covers the field's own label.
	 */
	alignItemWithTrigger?: boolean

	/** Replaces the default icon/label/description row. */
	renderOption?: (option: SelectOption) => ReactNode
	/** Replaces the trigger's value. Receives `undefined` in the placeholder state. */
	renderValue?: (option: SelectOption | undefined) => ReactNode

	className?: string
	/** Class for the popup surface. */
	contentClassName?: string

	onFocus?: FocusEventHandler<HTMLButtonElement>
	onBlur?: FocusEventHandler<HTMLButtonElement>
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
}

/*
 * Base UI reserves "" for an empty form value, so values are encoded: an option valued ""
 * maps to the clear sentinel, and the prefix keeps other values off the sentinel.
 */
const CLEAR_VALUE = "__ui_select_clear__"
const OPTION_PREFIX = "__ui_select_option__:"

const toInternal = (value: string) => (value === "" ? CLEAR_VALUE : `${OPTION_PREFIX}${value}`)

const toInternalSelected = (value: string | null | undefined) =>
	value === "" || value == null ? null : `${OPTION_PREFIX}${value}`

function toExternal(value: string | null): string | undefined {
	if (value === null || value === CLEAR_VALUE) return undefined
	return value.startsWith(OPTION_PREFIX) ? value.slice(OPTION_PREFIX.length) : undefined
}

function OptionContent({ option }: { option: SelectOption }) {
	return (
		<>
			{option.icon != null && (
				<span aria-hidden className={cx("select--option-icon", styles.optionIcon)}>
					{option.icon}
				</span>
			)}
			<span className={cx("select--option-text", styles.optionText)}>
				<Text
					tag="span"
					size="inherit"
					lineHeight="tight"
					weight={option.description ? "medium" : "regular"}
					truncate
					className="select--option-label"
				>
					{option.label}
				</Text>
				{!!option.description && (
					<span className={cx("select--option-description", styles.optionDescription)}>
						{option.description}
					</span>
				)}
			</span>
		</>
	)
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(props, ref) {
	// `hasOwnProperty`: `value={undefined}` means controlled and clear, not uncontrolled.
	const isControlled = Object.prototype.hasOwnProperty.call(props, "value")
	const {
		options,
		placeholder,
		strings,
		allowClear = false,
		invalid,
		value,
		defaultValue,
		onValueChange,
		disabled,
		readOnly,
		required,
		name,
		form,
		autoComplete,
		inputRef,
		id,
		open,
		defaultOpen,
		onOpenChange,
		modal,
		highlightItemOnHover,
		side,
		align,
		alignItemWithTrigger,
		renderOption,
		renderValue,
		className,
		contentClassName,
		onFocus,
		onBlur,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
	} = props

	// The `placeholder` shorthand wins over `strings.placeholder`.
	const copy = { ...defaultSelectStrings, ...strings, ...(placeholder ? { placeholder } : null) }

	const internalOptions = useMemo(() => {
		const mapped = options.map((option) => ({ option, internalValue: toInternal(option.value) }))
		if (allowClear && !mapped.some((entry) => entry.internalValue === CLEAR_VALUE)) {
			mapped.unshift({ internalValue: CLEAR_VALUE, option: { value: "", label: copy.placeholder } })
		}
		return mapped
	}, [allowClear, options, copy.placeholder])

	const byInternalValue = useMemo(
		() => new Map(internalOptions.map((entry) => [entry.internalValue, entry.option])),
		[internalOptions],
	)

	const handleValueChange = useCallback(
		(next: unknown) => onValueChange?.(toExternal(next as string | null)),
		[onValueChange],
	)

	// The hidden input submits the consumer's value, not the encoded one.
	const serializeValue = useCallback((internal: unknown) => toExternal(internal as string) ?? "", [])

	return (
		<SelectPrimitive.Root
			onValueChange={handleValueChange}
			disabled={disabled}
			readOnly={readOnly}
			required={required}
			name={name}
			form={form}
			autoComplete={autoComplete}
			inputRef={inputRef}
			id={id}
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			modal={modal}
			highlightItemOnHover={highlightItemOnHover}
			defaultValue={toInternalSelected(defaultValue)}
			itemToStringValue={serializeValue}
			{...(isControlled ? { value: toInternalSelected(value) } : {})}
		>
			<SelectPrimitive.Trigger
				ref={ref}
				data-field-control=""
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				/*
				 * OR in the `aria-invalid` FormField injects, since the trigger carries the role; a
				 * caller's `invalid` still wins.
				 */
				aria-invalid={invalid || ariaInvalid || undefined}
				onFocus={onFocus}
				onBlur={onBlur}
				className={cx("select--component", styles.trigger, className)}
			>
				<SelectPrimitive.Value className={cx("select--value", styles.value)}>
					{(currentValue: unknown) => {
						const key = currentValue as string | null
						const selected = key && key !== CLEAR_VALUE ? byInternalValue.get(key) : undefined
						const rendered = renderValue ? renderValue(selected) : (selected?.label ?? copy.placeholder)
						return typeof rendered === "string" ? (
							<Text tag="span" size="inherit" lineHeight="tight" truncate>
								{rendered}
							</Text>
						) : (
							rendered
						)
					}}
				</SelectPrimitive.Value>
				<SelectPrimitive.Icon className={styles.triggerIcon}>
					<ChevronDownIcon aria-hidden />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPopupContent
				side={side}
				align={align}
				alignItemWithTrigger={alignItemWithTrigger}
				className={cx("select--content", contentClassName)}
			>
				<SelectPopupGroup className="select--group">
					{internalOptions.map(({ internalValue, option }) => (
						<SelectPopupItem
							key={internalValue}
							value={internalValue}
							/* Base UI reads `label` for typeahead and the trigger's fallback text. */
							label={option.label}
							disabled={option.disabled}
							className="select--item"
						>
							{renderOption ? renderOption(option) : <OptionContent option={option} />}
						</SelectPopupItem>
					))}
				</SelectPopupGroup>
			</SelectPopupContent>
		</SelectPrimitive.Root>
	)
})
