import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cx } from "@/lib/cx"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"
import { Text } from "@/components/base/typography"

import { defaultComboboxStrings, type ComboboxStrings } from "./combobox.strings"
import styles from "./combobox.module.css"

/**
 * The state: Base UI's combobox root, holding `value` and `onValueChange`, `inputValue` and
 * `onInputValueChange`, `items` and `multiple`. The parts around it are the Base UI anatomy
 * with the kit's surface applied — parts, not a recipe; the searchable, single- and
 * multi-select recipes compose them. Field parts carry `data-field-control` /
 * `data-field-shell`, matching Input, Textarea and Select.
 */
export const ComboboxRoot = ComboboxPrimitive.Root
/**
 * The popup's portal, which escapes an ancestor that clips or transforms. Routed through the
 * nearest `UIPortalHost` like every kit popup.
 */
export function ComboboxPortal({ container, ...props }: ComboboxPrimitive.Portal.Props) {
	const portalContainer = useUIPortalContainer(container as UIPortalContainer | undefined)
	return <ComboboxPrimitive.Portal container={portalContainer} {...props} />
}
/** The renderer that maps a list to items. */
export const ComboboxCollection = ComboboxPrimitive.Collection

/** The query field. */
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
 * The input with its trailing chevron and optional clear button. Its trailing padding is
 * computed from the same variables that size the controls, so text never runs under them.
 */
export function ComboboxInputTrigger({
	className,
	showClear = false,
	invalid,
	strings,
	...props
}: ComboboxPrimitive.Input.Props & {
	/** Shows the clear button beside the chevron. */
	showClear?: boolean
	/** Applies the invalid treatment. */
	invalid?: boolean
	/** Names the two trailing controls: the clear button and the chevron. */
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
 * The whole field as one trigger, for a value that can only come from the list — a
 * select-like combobox with no free text. Pair it with `ComboboxPopupInput`: Base UI drives
 * the list's keyboard cursor from an input. For a short list with no search, use `Select`.
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
 * The search band inside the popup, for a combobox opened from a button (`ComboboxTrigger`)
 * rather than typed into: focus lands here when the popup opens, typing filters the list,
 * and the arrow keys and Enter still move through the list below it. Give it an
 * `aria-label` — its placeholder is not a name.
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

/** The current selection, shown in a `ComboboxTrigger`. */
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

/** The control that empties the field. */
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

/** Anchors the popup to the trigger, and flips it when there is no room below. */
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

/**
 * The list's surface, anchored to the field's width — unlike a dropdown menu, a listbox that
 * does not line up with its field reads as a different control.
 */
export function ComboboxPopup({ className, ...props }: ComboboxPrimitive.Popup.Props) {
	return (
		<ComboboxPrimitive.Popup
			data-slot="combobox-popup"
			className={cx("combobox-popup--component", styles.popup, className)}
			{...props}
		/>
	)
}

/** The results. */
export function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
	return (
		<ComboboxPrimitive.List data-slot="combobox-list" className={cx("combobox-list--component", styles.list, className)} {...props} />
	)
}

/**
 * A result row with a trailing selection check. Children go in the label slot. The same row
 * the pickers render.
 */
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

/** The tick on a chosen item, on its own, for a row that lays its parts out differently. */
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

/**
 * Renders only when a search returns nothing, so "no matches" never flashes before the first
 * keystroke.
 */
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

/** A division of the results. */
export function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
	return (
		<ComboboxPrimitive.Group data-slot="combobox-group" className={cx("combobox-group--component", styles.group, className)} {...props} />
	)
}

/** A group's caption. */
export function ComboboxGroupLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
	return (
		<ComboboxPrimitive.GroupLabel
			data-slot="combobox-group-label"
			className={cx("combobox-group-label--component", styles.groupLabel, className)}
			{...props}
		/>
	)
}

/** A rule between groups of results. */
export function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
	return (
		<ComboboxPrimitive.Separator
			data-slot="combobox-separator"
			className={cx("combobox-separator--component", styles.separator, className)}
			{...props}
		/>
	)
}

/**
 * The multi-select field: the container is the field, and the input sits among the chips so
 * typing continues where the last selection ended.
 */
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

/** The query input among the chips, so typing continues where the last selection ended. */
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

/** A layer behind the open popup, part of its placement machinery. */
export function ComboboxBackdrop({ className, ...props }: ComboboxPrimitive.Backdrop.Props) {
	return (
		<ComboboxPrimitive.Backdrop
			data-slot="combobox-backdrop"
			className={cx("combobox-backdrop--component", styles.backdrop, className)}
			{...props}
		/>
	)
}

/** An arrow pointing from the popup to its anchor, part of its placement machinery. */
export function ComboboxArrow({ className, ...props }: ComboboxPrimitive.Arrow.Props) {
	return <ComboboxPrimitive.Arrow className={cx("combobox-arrow--component", styles.arrow, className)} {...props} />
}
