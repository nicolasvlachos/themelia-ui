/** The single-select option group behind `CardRadioGroup` and `ListRadioGroup`. */
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { CircleCheckIcon, CircleIcon } from "lucide-react"
import { forwardRef, useId } from "react"

import { cx } from "@/lib/cx"

import { COLUMN_CLASS } from "../card-group-columns"
import styles from "../choice.module.css"
import type { ChoiceColumns, ChoiceGroupBaseProps, ChoiceOption } from "../choice.types"
import { ChoiceCardText, ChoiceDescription, ChoiceLabel } from "./choice-parts"
import { renderChoiceIcon } from "./choice-icon"

export interface RadioOptionGroupProps extends ChoiceGroupBaseProps {
	options: ChoiceOption[]
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	/** `cards` tiles the options in a grid; `list` stacks them as divided rows. */
	layout: "cards" | "list"
	/** Grid columns at full width, for `cards`. */
	columns?: ChoiceColumns
	/** The public component's name, for its `--component` and `--option` hooks. */
	hook: string
}

export const RadioOptionGroup = forwardRef<HTMLDivElement, RadioOptionGroupProps>(function RadioOptionGroup(
	{
		options,
		value,
		defaultValue,
		onValueChange,
		name,
		layout,
		columns = 3,
		invalid,
		disabled,
		hook,
		className,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		"aria-describedby": ariaDescribedby,
	},
	ref,
) {
	/* Per-group id base for each option's note. */
	const groupId = useId()
	const cards = layout === "cards"

	return (
		<RadioGroupPrimitive
			ref={ref}
			value={value}
			defaultValue={defaultValue}
			onValueChange={(next) => next != null && onValueChange?.(String(next))}
			name={name}
			disabled={disabled}
			aria-invalid={invalid || undefined}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledby}
			aria-describedby={ariaDescribedby}
			data-disabled={disabled || undefined}
			className={cx(`${hook}--component`, cards ? [styles.cardGrid, COLUMN_CLASS[columns]] : styles.list, className)}
		>
			{options.map((option) => {
				const noteId = `${groupId}-${option.value}-note`
				const label = (
					<ChoiceLabel option={option} weight={cards ? "semibold" : undefined} descriptionId={noteId} />
				)
				return (
					<RadioPrimitive.Root
						key={option.value}
						value={option.value}
						disabled={disabled || option.disabled}
						aria-invalid={invalid || undefined}
						/* Described by its own note: a control can't sit inside a control (see `ChoiceLabel`). */
						aria-describedby={option.tooltip == null ? undefined : noteId}
						className={cx(`${hook}--option`, cards ? styles.card : styles.listRow)}
					>
						{cards ? (
							<RadioPrimitive.Indicator render={<CircleCheckIcon aria-hidden className={styles.cardMark} />} />
						) : (
							/* Decorative: the whole row is the radio, so no second focusable control. */
							<span aria-hidden className={styles.listMarker}>
								<CircleIcon className={styles.listMarkerDot} />
							</span>
						)}
						{option.icon != null && <span className={styles.cardIcon}>{renderChoiceIcon(option.icon)}</span>}
						{cards ? (
							<ChoiceCardText>
								{label}
								<ChoiceDescription>{option.description}</ChoiceDescription>
							</ChoiceCardText>
						) : (
							<span className={styles.rowText}>
								{label}
								<ChoiceDescription>{option.description}</ChoiceDescription>
							</span>
						)}
					</RadioPrimitive.Root>
				)
			})}
		</RadioGroupPrimitive>
	)
})
