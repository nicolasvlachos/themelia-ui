/**
 * PillRadioGroup — a compact single-select of connected pill buttons, for two to four
 * options (timeframes, view modes). Plain buttons, not a toggle-group primitive, which
 * would strip the connected treatment's inner rounding; a hidden input submits the value.
 */
import { forwardRef, isValidElement, useCallback, useRef, type KeyboardEvent, type ReactNode } from "react"

import { cx } from "@/lib/cx"

import styles from "./choice.module.css"
import type { ChoiceGroupBaseProps, ChoiceOption } from "./choice.types"
import { isSimpleText, renderChoiceIcon } from "./partials"

export type PillRadioOption = ChoiceOption

/* Whether a label carries text to name the pill (`<span lang="nl">Nederlands</span>` does; an icon does not). */
function hasText(label: ReactNode): boolean {
	if (isSimpleText(label)) return true
	if (Array.isArray(label)) return label.some(hasText)
	return isValidElement<{ children?: ReactNode }>(label) && hasText(label.props.children)
}

export interface PillRadioGroupProps extends ChoiceGroupBaseProps {
	options: PillRadioOption[]
	/** Controlled value. `null` is the cleared state. */
	value: string | null | undefined
	onValueChange: (value: string | null) => void
	/** Lets the active pill be clicked again to clear the selection. */
	allowClear?: boolean
	/** Stretches the pills to fill the container. */
	fullWidth?: boolean
}

export const PillRadioGroup = forwardRef<HTMLDivElement, PillRadioGroupProps>(
	function PillRadioGroup(
		{
			options, value, onValueChange, allowClear = false, fullWidth = false, name, invalid, disabled, className,
			"aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby,
		},
		ref,
	) {
		const groupRef = useRef<HTMLDivElement | null>(null)
		const setRefs = (node: HTMLDivElement | null) => {
			groupRef.current = node
			if (typeof ref === "function") ref(node)
			else if (ref) ref.current = node
		}
		const enabled = options.filter((option) => !disabled && !option.disabled)
		/*
		 * Radio-group keys: one tab stop (the checked option, else the first enabled); arrows
		 * move and select, wrapping at the ends.
		 */
		const tabStop = enabled.find((option) => option.value === value)?.value ?? enabled[0]?.value
		const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: string) => {
			const rtl = groupRef.current ? getComputedStyle(groupRef.current).direction === "rtl" : false
			const index = enabled.findIndex((option) => option.value === current)
			const step =
				event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1
				: event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? -1
				: 0
			const target =
				event.key === "Home" ? enabled[0]
				: event.key === "End" ? enabled.at(-1)
				: step !== 0 && enabled.length > 0 ? enabled[(index + step + enabled.length) % enabled.length]
				: undefined
			if (!target) return
			event.preventDefault()
			if (target.value !== value) onValueChange(target.value)
			groupRef.current
				?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(target.value)}"]`)
				?.focus()
		}
		const handleClick = useCallback(
			(next: string) => {
				if (next === value) {
					if (allowClear) onValueChange(null)
					return
				}
				onValueChange(next)
			},
			[allowClear, onValueChange, value],
		)

		return (
			<div
				ref={setRefs}
				role="radiogroup"
				data-name={name}
				aria-invalid={invalid || undefined}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledby}
				aria-describedby={ariaDescribedby}
				data-disabled={disabled || undefined}
				className={cx(
					"pill-radio-group--component",
					styles.pillGroup,
					fullWidth && styles.pillGroupFullWidth,
					className,
				)}
			>
				{options.map((option) => {
					const isSelected = option.value === value
					return (
						<button
							key={option.value}
							type="button"
							role="radio"
							aria-checked={isSelected}
							data-value={option.value}
							tabIndex={option.value === tabStop ? 0 : -1}
							onKeyDown={(event) => onKeyDown(event, option.value)}
							/* A label with no text (an icon) gives no accessible name, so the value stands in. */
							aria-label={hasText(option.label) ? undefined : option.value}
							disabled={disabled || option.disabled}
							onClick={() => handleClick(option.value)}
							className={cx("pill-radio-group--option", styles.pill, fullWidth && styles.pillFullWidth)}
						>
							{renderChoiceIcon(option.icon)}
							{option.label}
						</button>
					)
				})}
				{/* Submits like a native radio group: nothing when cleared or disabled. */}
				{name !== undefined && value != null && (
					<input type="hidden" name={name} value={value} disabled={disabled} />
				)}
			</div>
		)
	},
)
