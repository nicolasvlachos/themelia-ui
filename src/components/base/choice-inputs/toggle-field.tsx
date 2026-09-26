/**
 * ToggleField — a clickable label-and-control row for a switch or checkbox, as a plain row
 * or (`surface="card"`) a bordered settings card with an optional icon and hint.
 * `SwitchCard` is the card form, preset.
 */
import { forwardRef, useCallback, useId, useState, type MouseEvent, type ReactNode } from "react"

import { Label } from "@/components/base/label"
import { cx } from "@/lib/cx"

import { Checkbox } from "./checkbox"
import styles from "./choice.module.css"
import type { ChoiceOption } from "./choice.types"
import { ChoiceDescription, renderChoiceIcon } from "./partials"
import { Switch } from "./switch"

export type ToggleFieldKind = "switch" | "checkbox"

export interface ToggleFieldProps {
	label: ReactNode
	description?: ReactNode
	/** Short guidance under the description. */
	hint?: ReactNode
	/** Leading glyph, drawn in a medallion. Most at home on `surface="card"`. */
	icon?: ChoiceOption["icon"]
	/** Which control renders. */
	kind?: ToggleFieldKind
	/**
	 * `row` is a plain settings row; `card` is a bordered card that takes the checked
	 * colour — the form `SwitchCard` presets.
	 */
	surface?: "row" | "card"
	/** Controlled state. */
	value?: boolean
	defaultValue?: boolean
	onValueChange?: (checked: boolean) => void
	disabled?: boolean
	invalid?: boolean
	name?: string
	/**
	 * What the field submits when off. Unset, an unchecked control submits nothing (the
	 * platform rule). Set, a hidden input always submits `"1"` when on and this when off.
	 * `SwitchCard` sets `"0"`.
	 */
	uncheckedValue?: string
	/** Puts the control on the leading edge instead of the trailing one. */
	controlPosition?: "leading" | "trailing"
	className?: string
}

export const ToggleField = forwardRef<HTMLDivElement, ToggleFieldProps>(function ToggleField(
	{
		label,
		description,
		hint,
		icon,
		kind = "switch",
		surface = "row",
		value,
		defaultValue,
		onValueChange,
		disabled = false,
		invalid = false,
		name,
		uncheckedValue,
		controlPosition = "trailing",
		className,
	},
	ref,
) {
	const isControlled = value !== undefined
	const [internal, setInternal] = useState(defaultValue ?? false)
	const checked = isControlled ? (value ?? false) : internal
	const inputId = useId()
	const descriptionId = description != null ? `${inputId}-description` : undefined
	const card = surface === "card"
	// With a hidden input carrying the value, the control must not submit too.
	const hiddenValue = name && uncheckedValue !== undefined
	const controlName = hiddenValue ? undefined : name

	const set = useCallback(
		(next: boolean) => {
			if (disabled) return
			if (!isControlled) setInternal(next)
			onValueChange?.(next)
		},
		[disabled, isControlled, onValueChange],
	)

	/* Skip clicks on the control or label, or the two toggles would cancel out. */
	const onRowClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement
		if (target.closest('label, [role="switch"], input[type="checkbox"]')) return
		set(!checked)
	}

	const controlProps = {
		id: inputId,
		name: controlName,
		checked,
		onChange: (event: { target: { checked: boolean } }) => set(event.target.checked),
		disabled,
		"aria-invalid": invalid || undefined,
		"aria-describedby": descriptionId,
	}
	const control = kind === "switch" ? <Switch {...controlProps} /> : <Checkbox {...controlProps} />

	return (
		<div
			ref={ref}
			data-checked={card ? checked : undefined}
			data-disabled={(card && disabled) || undefined}
			data-invalid={(card && invalid) || undefined}
			onClick={onRowClick}
			className={cx(
				card ? "switch-card--component" : "toggle-field--component",
				styles.row,
				card && styles.switchCard,
				disabled && styles.rowDisabled,
				className,
			)}
		>
			{hiddenValue && <input type="hidden" name={name} value={checked ? "1" : uncheckedValue} />}

			{controlPosition === "leading" && <div className={styles.rowControl}>{control}</div>}

			{icon != null && <span className={styles.switchCardIcon}>{renderChoiceIcon(icon)}</span>}

			<div className={styles.rowText}>
				<Label htmlFor={inputId} className={styles.rowLabel}>
					{label}
				</Label>
				{description != null && (
					<span id={descriptionId}>
						<ChoiceDescription>{description}</ChoiceDescription>
					</span>
				)}
				{hint != null && <span className={styles.hint}>{hint}</span>}
			</div>

			{controlPosition === "trailing" && <div className={styles.rowControl}>{control}</div>}
		</div>
	)
})
