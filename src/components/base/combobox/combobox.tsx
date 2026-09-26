import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cx } from "@/lib/cx"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"
import { Text } from "@/components/base/typography"

import { defaultComboboxStrings, type ComboboxStrings } from "./combobox.strings"
import styles from "./combobox.module.css"

/**
 * The Base UI combobox anatomy with the kit's surface applied — parts, not a recipe; the
 * searchable, single- and multi-select recipes compose them. Field parts carry
 * `data-field-control` / `data-field-shell`, matching Input, Textarea and Select.
 */
export const ComboboxRoot = ComboboxPrimitive.Root
/** The popup's portal, routed through the nearest `UIPortalHost` like every kit popup. */
export function ComboboxPortal({ container, ...props }: ComboboxPrimitive.Portal.Props) {
	const portalContainer = useUIPortalContainer(container as UIPortalContainer | undefined)
	return <ComboboxPrimitive.Portal container={portalContainer} {...props} />
}
export const ComboboxCollection = ComboboxPrimitive.Collection

export function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
	return (
		<ComboboxPrimitive.Input
			data-slot="combobox-input"
			data-field-control=""
			className={cx("combobox-input--component", styles.input, className)}
			{...props}
		/>
	)
}

/**
 * The input with its trailing chevron and optional clear button, padded so text never
 * runs under them. `strings` names the two trailing controls.
 */
export function ComboboxInputTrigger({
	className,
	showClear = false,
	invalid,
	strings,
	...props
}: ComboboxPrimitive.Input.Props & {
	showClear?: boolean
	invalid?: boolean
	strings?: Partial<Pick<ComboboxStrings, "clear" | "toggle">>
}) {
	const copy = { ...defaultComboboxStrings, ...strings }
	return (
		<div className={styles.inputWrap} data-has-clear={showClear || undefined}>
			<ComboboxPrimitive.Input
				data-slot="combobox-input"
				data-field-control=""
				aria-invalid={invalid || undefined}
				className={cx("combobox-input--component", styles.input, className)}
				{...props}
			/>
			<div className={styles.actions}>
				{showClear && (
					<ComboboxPrimitive.Clear
						data-slot="combobox-clear"
						data-hit-area
						aria-label={copy.clear}
						className={styles.action}
					>
						<XIcon aria-hidden />
					</ComboboxPrimitive.Clear>
				)}
				<ComboboxPrimitive.Trigger
					data-hit-area
					aria-label={copy.toggle}
					className={styles.action}
				>
					<ChevronDownIcon aria-hidden />
				</ComboboxPrimitive.Trigger>
			</div>
		</div>
	)
}

/**
 * The whole field as one trigger — a select-like combobox with no free text. Pair it with
 * `ComboboxPopupInput`: Base UI drives the list's keyboard cursor from an input. For a
 * short list with no search, use `Select`.
 */
export function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
	return (
		<ComboboxPrimitive.Trigger
			data-slot="combobox-trigger"
			data-field-control=""
			className={cx("combobox-trigger--component", styles.trigger, className)}
			{...props}
		>
			{children}
			<ComboboxPrimitive.Icon className={styles.triggerIcon}>
				<ChevronDownIcon aria-hidden />
			</ComboboxPrimitive.Icon>
		</ComboboxPrimitive.Trigger>
	)
}

/**
 * The search band inside the popup, for the `ComboboxTrigger` shape: focus lands here when
 * the popup opens, typing filters the list, and the arrow keys and Enter drive it. Give it
 * an `aria-label` — its placeholder is not a name.
 */
export function ComboboxPopupInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
	return (
		<div data-slot="combobox-popup-input" className={styles.popupSearch}>
			<SearchIcon aria-hidden className={styles.popupSearchIcon} />
			<ComboboxPrimitive.Input
				data-slot="combobox-input"
				className={cx("combobox-popup-input--component", styles.popupSearchInput, className)}
				{...props}
			/>
		</div>
	)
}

export function ComboboxValue({
	placeholder,
	...props
}: ComboboxPrimitive.Value.Props & { placeholder?: ReactNode }) {
	return (
		<ComboboxPrimitive.Value
			data-slot="combobox-value"
			placeholder={
				placeholder ? (
					<Text tag="span" size="inherit" type="secondary" className="combobox-value--component">
						{placeholder}
					</Text>
				) : undefined
			}
			{...props}
		/>
	)
}

export function ComboboxClear({ className, children, ...props }: ComboboxPrimitive.Clear.Props) {
	return (
		<ComboboxPrimitive.Clear
			data-slot="combobox-clear"
			data-hit-area
			aria-label={defaultComboboxStrings.clear}
			className={cx("combobox-clear--component", styles.action, className)}
			{...props}
		>
			{children ?? <XIcon aria-hidden />}
		</ComboboxPrimitive.Clear>
	)
}

export function ComboboxPositioner({
	className,
	sideOffset = 4,
	...props
}: ComboboxPrimitive.Positioner.Props) {
	return (
		<ComboboxPrimitive.Positioner
			data-slot="combobox-positioner"
			sideOffset={sideOffset}
			className={cx("combobox-positioner--component", styles.positioner, className)}
			{...props}
		/>
	)
}

export function ComboboxPopup({ className, ...props }: ComboboxPrimitive.Popup.Props) {
	return (
		<ComboboxPrimitive.Popup
			data-slot="combobox-popup"
			className={cx("combobox-popup--component", styles.popup, className)}
			{...props}
		/>
	)
}

export function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
	return (
		<ComboboxPrimitive.List data-slot="combobox-list" className={cx("combobox-list--component", styles.list, className)} {...props} />
	)
}

export function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
	return (
		<ComboboxPrimitive.Item
			data-slot="combobox-item"
			className={cx("combobox-item--component", styles.item, className)}
			{...props}
		>
			<span className={styles.itemLabel}>{children}</span>
			<ComboboxPrimitive.ItemIndicator className={styles.indicator}>
				<CheckIcon aria-hidden />
			</ComboboxPrimitive.ItemIndicator>
		</ComboboxPrimitive.Item>
	)
}

/** The indicator on its own, for a row that lays its parts out differently. */
export function ComboboxItemIndicator({
	className,
	children,
	...props
}: ComboboxPrimitive.ItemIndicator.Props) {
	return (
		<ComboboxPrimitive.ItemIndicator
			data-slot="combobox-item-indicator"
			className={cx("combobox-item-indicator--component", styles.indicator, className)}
			{...props}
		>
			{children ?? <CheckIcon aria-hidden />}
		</ComboboxPrimitive.ItemIndicator>
	)
}

export function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
	return (
		<ComboboxPrimitive.Empty data-slot="combobox-empty" className={cx("combobox-empty--component", styles.empty, className)} {...props} />
	)
}

/** Async status — "Searching…", "12 of 340". Hidden while empty. */
export function ComboboxStatus({ className, ...props }: ComboboxPrimitive.Status.Props) {
	return (
		<ComboboxPrimitive.Status data-slot="combobox-status" className={cx("combobox-status--component", styles.status, className)} {...props} />
	)
}

export function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
	return (
		<ComboboxPrimitive.Group data-slot="combobox-group" className={cx("combobox-group--component", styles.group, className)} {...props} />
	)
}

export function ComboboxGroupLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
	return (
		<ComboboxPrimitive.GroupLabel
			data-slot="combobox-group-label"
			className={cx("combobox-group-label--component", styles.groupLabel, className)}
			{...props}
		/>
	)
}

export function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
	return (
		<ComboboxPrimitive.Separator
			data-slot="combobox-separator"
			className={cx("combobox-separator--component", styles.separator, className)}
			{...props}
		/>
	)
}

export function ComboboxChips({
	className,
	invalid,
	...props
}: ComboboxPrimitive.Chips.Props & { invalid?: boolean }) {
	return (
		<ComboboxPrimitive.Chips
			data-slot="combobox-chips"
			data-field-shell=""
			aria-invalid={invalid || undefined}
			className={cx("combobox-chips--component", styles.chips, className)}
			{...props}
		/>
	)
}

/**
 * One selection inside `ComboboxChips`, with its remove control.
 *
 * The remove control is named from the chip's text, so pass the label as plain text. For
 * a chip with richer content, `strings.removeChip` supplies the name instead.
 */
export function ComboboxChip({
	className,
	children,
	strings,
	...props
}: ComboboxPrimitive.Chip.Props & { strings?: Partial<Pick<ComboboxStrings, "removeChip">> }) {
	const copy = { ...defaultComboboxStrings, ...strings }
	return (
		<ComboboxPrimitive.Chip data-slot="combobox-chip" className={cx("combobox-chip--component", styles.chip, className)} {...props}>
			{children}
			<ComboboxPrimitive.ChipRemove
				data-hit-area
				/* Named with the chip's text, so each remove button says what it removes. */
				aria-label={copy.removeChip(
					typeof children === "string" || typeof children === "number" ? String(children) : "item",
				)}
				className={styles.chipRemove}
			>
				<XIcon aria-hidden />
			</ComboboxPrimitive.ChipRemove>
		</ComboboxPrimitive.Chip>
	)
}

export function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
	return (
		<ComboboxPrimitive.Input
			data-slot="combobox-chips-input"
			/* Lets the chips shell's `:has([data-field-control]:focus-visible)` ring match. */
			data-field-control=""
			className={cx("combobox-chips-input--component", styles.chipsInput, className)}
			{...props}
		/>
	)
}

export function ComboboxBackdrop({ className, ...props }: ComboboxPrimitive.Backdrop.Props) {
	return (
		<ComboboxPrimitive.Backdrop
			data-slot="combobox-backdrop"
			className={cx("combobox-backdrop--component", styles.backdrop, className)}
			{...props}
		/>
	)
}

export function ComboboxArrow({ className, ...props }: ComboboxPrimitive.Arrow.Props) {
	return <ComboboxPrimitive.Arrow className={cx("combobox-arrow--component", styles.arrow, className)} {...props} />
}
