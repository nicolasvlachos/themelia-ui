/**
 * The Select popup anatomy — public so every finite-option control (phone country, unit
 * pickers) renders the same popup and rows.
 */
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import styles from "./select.module.css"

function isSimpleText(value: ReactNode): value is string | number | bigint {
	return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
}

export type SelectPopupContentProps = SelectPrimitive.Popup.Props &
	Pick<
		SelectPrimitive.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
	> & {
		/**
		 * Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's
		 * own target.
		 */
		container?: UIPortalContainer
	}

export function SelectPopupContent({
	container,
	className,
	children,
	side = "bottom",
	sideOffset = 4,
	align = "start",
	alignOffset = 0,
	/* Off by default: inside a form, a popup over the trigger hides the field's label. */
	alignItemWithTrigger = false,
	...props
}: SelectPopupContentProps) {
	const portalContainer = useUIPortalContainer(container)

	return (
		<SelectPrimitive.Portal container={portalContainer}>
			<SelectPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				alignItemWithTrigger={alignItemWithTrigger}
				className={styles.positioner}
			>
				<SelectPrimitive.Popup
					data-slot="select-content"
					data-align-trigger={alignItemWithTrigger}
					className={cx("select-popup--component", styles.popup, className)}
					{...props}
				>
					<SelectPopupScrollUpArrow />
					<SelectPrimitive.List>{children}</SelectPrimitive.List>
					<SelectPopupScrollDownArrow />
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	)
}

export function SelectPopupGroup({ className, ...props }: SelectPrimitive.Group.Props) {
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			className={cx("select-popup--group", styles.group, className)}
			{...props}
		/>
	)
}

export function SelectPopupItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cx("select-popup--item", styles.item, className)}
			{...props}
		>
			<SelectPrimitive.ItemText className={styles.itemText}>
				{isSimpleText(children) ? (
					<Text tag="span" size="inherit" lineHeight="tight">
						{children}
					</Text>
				) : (
					children
				)}
			</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator className={styles.indicator}>
				<CheckIcon aria-hidden />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	)
}

export function SelectPopupLabel({ className, children, ...props }: SelectPrimitive.GroupLabel.Props) {
	return (
		<SelectPrimitive.GroupLabel
			data-slot="select-label"
			className={cx("select-popup--label", styles.label, className)}
			{...props}
		>
			{children}
		</SelectPrimitive.GroupLabel>
	)
}

export function SelectPopupSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cx("select-popup--separator", styles.separator, className)}
			{...props}
		/>
	)
}

function SelectPopupScrollUpArrow(props: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
	return (
		<SelectPrimitive.ScrollUpArrow
			className={cx(styles.scrollArrow, styles.scrollArrowUp)}
			{...props}
		>
			<ChevronUpIcon aria-hidden />
		</SelectPrimitive.ScrollUpArrow>
	)
}

function SelectPopupScrollDownArrow(props: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
	return (
		<SelectPrimitive.ScrollDownArrow
			className={cx(styles.scrollArrow, styles.scrollArrowDown)}
			{...props}
		>
			<ChevronDownIcon aria-hidden />
		</SelectPrimitive.ScrollDownArrow>
	)
}

/** The primitives, for a control that needs the state engine but not this presentation. */
export const SelectRoot = SelectPrimitive.Root
export const SelectTriggerPrimitive = SelectPrimitive.Trigger
export const SelectValuePrimitive = SelectPrimitive.Value
export const SelectIconPrimitive = SelectPrimitive.Icon
