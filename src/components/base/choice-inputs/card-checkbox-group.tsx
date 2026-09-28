/**
 * CardCheckboxGroup — multi-select as a grid of cards, sharing CardRadioGroup's geometry.
 * No checkbox-group primitive exists, so each card is an `aria-pressed` toggle button with
 * a hidden input per selected value.
 */
import { CircleCheckIcon } from "lucide-react"
import { forwardRef, useCallback, useId, useMemo, useState } from "react"

import { cx } from "@/lib/cx"

import { COLUMN_CLASS } from "./card-group-columns"
import styles from "./choice.module.css"
import type { ChoiceColumns, ChoiceGroupBaseProps, ChoiceOption } from "./choice.types"
import { ChoiceCardText, ChoiceDescription, ChoiceLabel, renderChoiceIcon } from "./partials"

export type CardCheckboxOption = ChoiceOption

export interface CardCheckboxGroupProps extends ChoiceGroupBaseProps {
	/** The choices, in the shape `CardRadioGroup` takes. */
	options: CardCheckboxOption[]
	/** Controlled value. */
	value?: string[]
	/** The initial values, for uncontrolled selection. */
	defaultValue?: string[]
	/** Called with every chosen value. */
	onValueChange?: (values: string[]) => void
	/** Column count at full width, as on `CardRadioGroup`. */
	columns?: ChoiceColumns
}

/**
 * The same cards as `CardRadioGroup` for a multiple choice: takes and returns an array of
 * values.
 */
export const CardCheckboxGroup = forwardRef<HTMLDivElement, CardCheckboxGroupProps>(
	function CardCheckboxGroup(
		{ options, value, defaultValue, onValueChange, name, columns = 3, invalid, disabled, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby },
		ref,
	) {
		/* Per-group id base for each option's note, as in RadioOptionGroup. */
		const groupId = useId()
		const isControlled = value !== undefined
		const [internal, setInternal] = useState<string[]>(defaultValue ?? [])
		const selected = useMemo(() => (isControlled ? (value ?? []) : internal), [internal, isControlled, value])

		const toggle = useCallback(
			(next: string) => {
				if (disabled) return
				if (options.find((option) => option.value === next)?.disabled) return
				const values = selected.includes(next)
					? selected.filter((entry) => entry !== next)
					: [...selected, next]
				if (!isControlled) setInternal(values)
				onValueChange?.(values)
			},
			[disabled, options, selected, isControlled, onValueChange],
		)

		return (
			<div
				ref={ref}
				role="group"
				// oxlint-disable-next-line jsx-a11y/role-supports-aria-props -- FormField's invalid state, kept on the group it describes
				aria-invalid={invalid || undefined}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledby}
				aria-describedby={ariaDescribedby}
				aria-disabled={disabled || undefined}
				className={cx(
					"card-checkbox-group--component",
					styles.cardGrid,
					COLUMN_CLASS[columns],
					className,
				)}
			>
					{options.map((option) => {
						const isSelected = selected.includes(option.value)
						const noteId = `${groupId}-${option.value}-note`
						return (
							<div key={option.value}>
								{/* One hidden input per selected value (`name[]`), the native multi-value serialisation. */}
								<input
									type="hidden"
									name={name ? `${name}[]` : undefined}
									value={option.value}
									aria-hidden="true"
									hidden
									disabled={!(name && isSelected)}
								/>
								<button
									type="button"
									aria-pressed={isSelected}
									// oxlint-disable-next-line jsx-a11y/role-supports-aria-props -- each option carries the group's invalid state, as a radio in a radio group does
									aria-invalid={invalid || undefined}
									/* Described by its own note: a control can't sit inside a control (see `ChoiceLabel`). */
									aria-describedby={option.tooltip == null ? undefined : noteId}
									data-selected={isSelected}
									disabled={disabled || option.disabled}
									onClick={() => toggle(option.value)}
									className={cx("card-checkbox-group--option", styles.card)}
								>
									{isSelected && <CircleCheckIcon aria-hidden className={styles.cardMark} />}
									{option.icon != null && (
										<span className={styles.cardIcon}>{renderChoiceIcon(option.icon)}</span>
									)}
									<ChoiceCardText>
										<ChoiceLabel option={option} descriptionId={noteId} />
										<ChoiceDescription>{option.description}</ChoiceDescription>
									</ChoiceCardText>
								</button>
							</div>
						)
				})}
			</div>
		)
	},
)
