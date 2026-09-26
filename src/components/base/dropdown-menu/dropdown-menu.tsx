import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"

import { cx } from "@/lib/cx"
import { useOverlayConfig, useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import styles from "./dropdown-menu.module.css"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
	return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
	return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
	return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
	container,
	align = "start",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	width,
	minWidth,
	maxWidth,
	className,
	style,
	...props
}: MenuPrimitive.Popup.Props &
	Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
		/**
		 * Fixed surface width: any CSS length, or `"trigger"` to match the trigger (Select-like).
		 * Unset, the menu sizes to its widest row, capped by `maxWidth`.
		 */
		width?: string | number | "trigger"
		/** Floor for the content-sized default. */
		minWidth?: string | number
		/** Ceiling for the content-sized default: a reading measure, so one long label doesn't widen every row. */
		maxWidth?: string | number
		/**
		 * Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's
		 * own target.
		 */
		container?: UIPortalContainer
	}) {
	const portalContainer = useUIPortalContainer(container)
	const { darkMenus } = useOverlayConfig()
	const size = (value: string | number | undefined) =>
		typeof value === "number" ? `${value}px` : value

	return (
		<MenuPrimitive.Portal container={portalContainer}>
			<MenuPrimitive.Positioner
				className={styles.positioner}
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
			>
				{/* Dark unless the provider sets `overlay.darkMenus: false`; `dark` is the global theme class, passed as a plain string. */}
				<MenuPrimitive.Popup
					data-slot="dropdown-menu-content"
					className={cx("dropdown-menu-content--component", darkMenus && "dark", styles.content, className)}
					style={{
						...(width === "trigger"
							? { width: "var(--anchor-width)" }
							: width != null && { width: size(width) }),
						...(minWidth != null && { minWidth: size(minWidth) }),
						...(maxWidth != null && { maxWidth: size(maxWidth) }),
						...style,
					}}
					{...props}
				/>
			</MenuPrimitive.Positioner>
		</MenuPrimitive.Portal>
	)
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
	return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: MenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
	return (
		<MenuPrimitive.GroupLabel
			data-slot="dropdown-menu-label"
			data-inset={inset || undefined}
			className={cx("dropdown-menu-label--component", styles.label, className)}
			{...props}
		/>
	)
}

/**
 * Slots every menu row shares. Props rather than children keep row layout identical: only
 * the label gives way, so a long name truncates instead of pushing the shortcut off.
 */
interface MenuRowSlots {
	/** Leading glyph. Aligns to the first line when a description is present. */
	icon?: React.ReactNode
	/** Second line under the label. Wraps rather than truncating on one line. */
	description?: React.ReactNode
	/** Trailing content — a keyboard shortcut, a badge, a count. */
	shortcut?: React.ReactNode
	/** Trailing content beside the shortcut, for anything that is not a shortcut. */
	trailing?: React.ReactNode
	inset?: boolean
}

/** Lays the slots out. Shared by the plain, link, checkbox, and radio rows. */
function MenuRowContent({ icon, description, shortcut, trailing, children }: MenuRowSlots & { children?: React.ReactNode }) {
	/* A `<DropdownMenuShortcut>` child joins the trailing column rather than the label. */
	const parts = React.Children.toArray(children)
	const childShortcuts = parts.filter((part) => React.isValidElement(part) && part.type === DropdownMenuShortcut)
	const label = childShortcuts.length ? parts.filter((part) => !childShortcuts.includes(part)) : children
	const trailingShortcut = shortcut ?? (childShortcuts.length ? childShortcuts : undefined)
	const hasSlots = icon != null || description != null || trailingShortcut != null || trailing != null
	if (!hasSlots) return <>{children}</>

	return (
		<>
			{icon != null && <span className={styles.itemIcon}>{icon}</span>}
			<span className={styles.itemBody}>
				<span className={styles.itemLabel}>{label}</span>
				{description != null && <span className={styles.itemDescription}>{description}</span>}
			</span>
			{(trailingShortcut != null || trailing != null) && (
				<span className={styles.itemTrailing}>
					{trailing}
					{shortcut != null ? <span className={styles.shortcut}>{shortcut}</span> : trailingShortcut}
				</span>
			)}
		</>
	)
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	icon,
	description,
	shortcut,
	trailing,
	children,
	...props
}: MenuPrimitive.Item.Props & MenuRowSlots & { variant?: "default" | "destructive" }) {
	return (
		<MenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset || undefined}
			data-variant={variant}
			className={cx("dropdown-menu-item--component", styles.item, description != null && styles.itemWithDescription, className)}
			{...props}
		>
			<MenuRowContent icon={icon} description={description} shortcut={shortcut} trailing={trailing}>
				{children}
			</MenuRowContent>
		</MenuPrimitive.Item>
	)
}

function DropdownMenuLinkItem({
	className,
	inset,
	variant = "default",
	icon,
	description,
	shortcut,
	trailing,
	children,
	...props
}: MenuPrimitive.LinkItem.Props & MenuRowSlots & { variant?: "default" | "destructive" }) {
	return (
		<MenuPrimitive.LinkItem
			data-slot="dropdown-menu-link-item"
			data-inset={inset || undefined}
			data-variant={variant}
			className={cx("dropdown-menu-link-item--component", styles.item, description != null && styles.itemWithDescription, className)}
			{...props}
		>
			<MenuRowContent icon={icon} description={description} shortcut={shortcut} trailing={trailing}>
				{children}
			</MenuRowContent>
		</MenuPrimitive.LinkItem>
	)
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
	return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
	return (
		<MenuPrimitive.SubmenuTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset || undefined}
			className={cx("dropdown-menu-sub-trigger--component", styles.item, className)}
			{...props}
		>
			{children}
			<ChevronRightIcon className={styles.subTriggerIcon} />
		</MenuPrimitive.SubmenuTrigger>
	)
}

function DropdownMenuSubContent({
	align = "start",
	/*
	 * Offsets mirror the popup inset (--space-md, 8px): -8 aligns the submenu's first row with
	 * its parent row; 8 + 4 sits it 4px clear of the parent surface.
	 */
	alignOffset = -8,
	side = "right",
	sideOffset = 12,
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
	return (
		<DropdownMenuContent
			data-slot="dropdown-menu-sub-content"
			className={cx("dropdown-menu-sub-content--component", styles.subContent, className)}
			align={align}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			{...props}
		/>
	)
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	icon,
	description,
	...props
}: MenuPrimitive.CheckboxItem.Props & Pick<MenuRowSlots, "icon" | "description" | "inset">) {
	return (
		<MenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset || undefined}
			className={cx("dropdown-menu-checkbox-item--component", styles.item, styles.choiceItem, className)}
			checked={checked}
			{...props}
		>
			<span className={styles.indicator} data-slot="dropdown-menu-checkbox-item-indicator">
				<MenuPrimitive.CheckboxItemIndicator>
					<CheckIcon />
				</MenuPrimitive.CheckboxItemIndicator>
			</span>
			{/* Through the shared row layout, so its label sits in the same column as icon rows. */}
			<MenuRowContent icon={icon} description={description}>
				{children}
			</MenuRowContent>
		</MenuPrimitive.CheckboxItem>
	)
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
	return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({
	className,
	children,
	inset,
	icon,
	description,
	...props
}: MenuPrimitive.RadioItem.Props & Pick<MenuRowSlots, "icon" | "description" | "inset">) {
	return (
		<MenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			data-inset={inset || undefined}
			className={cx("dropdown-menu-radio-item--component", styles.item, styles.choiceItem, className)}
			{...props}
		>
			<span className={styles.indicator} data-slot="dropdown-menu-radio-item-indicator">
				<MenuPrimitive.RadioItemIndicator>
					<CheckIcon />
				</MenuPrimitive.RadioItemIndicator>
			</span>
			{/* Through the shared row layout, so its label sits in the same column as icon rows. */}
			<MenuRowContent icon={icon} description={description}>
				{children}
			</MenuRowContent>
		</MenuPrimitive.RadioItem>
	)
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
	return (
		<MenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cx("dropdown-menu-separator--component", styles.separator, className)}
			{...props}
		/>
	)
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span data-slot="dropdown-menu-shortcut" className={cx("dropdown-menu-shortcut--component", styles.shortcut, className)} {...props} />
	)
}

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuLinkItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
}
