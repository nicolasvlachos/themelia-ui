/**
 * NavigationMenu — a horizontal nav whose entries can open a panel (a mega menu). For route
 * navigation that knows the current page, use `SideNav`, `NavigationTabs` or `AppSidebar`.
 */
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

import { textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import styles from "./navigation-menu.module.css"

export interface NavigationMenuProps extends NavigationMenuPrimitive.Root.Props {
	/**
	 * Where the bar's one panel opens relative to the open entry. Set on the bar, because
	 * every entry shares the panel: moving between entries resizes it rather than swapping it.
	 */
	side?: NavigationMenuPrimitive.Positioner.Props["side"]
	/** The gap between the open entry and the panel, in pixels. */
	sideOffset?: NavigationMenuPrimitive.Positioner.Props["sideOffset"]
	/**
	 * How the panel lines up with the open entry. At `start` it lines up with the entry's
	 * start, so a panel under the first entry never hangs past the bar's own edge.
	 */
	align?: NavigationMenuPrimitive.Positioner.Props["align"]
	/** Where the panel renders. Defaults to the nearest `UIPortalHost`, else the primitive's own. */
	container?: UIPortalContainer
}

/**
 * Site navigation with rich panels, in a real `<nav>`. Not Menubar: a menubar commands the
 * current view, a navigation menu goes somewhere, and the difference decides whether the
 * items are buttons or links.
 *
 * The bar, and the one panel every entry shares: each `NavigationMenuContent` is drawn into
 * its viewport, so moving between entries resizes one panel.
 */
export function NavigationMenu({
	className,
	children,
	side = "bottom",
	sideOffset = 8,
	align = "start",
	container,
	...props
}: NavigationMenuProps) {
	const portalContainer = useUIPortalContainer(container)

	return (
		<NavigationMenuPrimitive.Root
			data-slot="navigation-menu"
			className={cx("navigation-menu--component", styles.root, className)}
			{...props}
		>
			{children}
			<NavigationMenuPrimitive.Portal container={portalContainer}>
				<NavigationMenuPrimitive.Positioner
					side={side}
					sideOffset={sideOffset}
					align={align}
					className={styles.positioner}
				>
					<NavigationMenuPrimitive.Popup className={styles.popup}>
						<NavigationMenuPrimitive.Viewport className={styles.viewport} />
					</NavigationMenuPrimitive.Popup>
				</NavigationMenuPrimitive.Positioner>
			</NavigationMenuPrimitive.Portal>
		</NavigationMenuPrimitive.Root>
	)
}

/** The row of entries. */
export function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
	return (
		<NavigationMenuPrimitive.List
			data-slot="navigation-menu-list"
			className={cx("navigation-menu-list--component", styles.list, className)}
			{...props}
		/>
	)
}

/** One entry: a trigger with its panel content, or a link that goes straight somewhere. */
export function NavigationMenuItem({ ...props }: NavigationMenuPrimitive.Item.Props) {
	return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} />
}

/** The word that opens an entry's panel. */
export function NavigationMenuTrigger({ className, ...props }: NavigationMenuPrimitive.Trigger.Props) {
	return (
		<NavigationMenuPrimitive.Trigger
			data-slot="navigation-menu-trigger"
			className={cx("navigation-menu-trigger--component", styles.trigger, textClassName({ size: "sm", weight: "medium" }), className)}
			{...props}
		/>
	)
}

/**
 * A destination inside a panel, or an entry of its own. A real anchor, so middle-click and
 * copy-link work and a screen reader announces a link.
 */
export function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
	return (
		<NavigationMenuPrimitive.Link
			data-slot="navigation-menu-link"
			className={cx("navigation-menu-link--component", styles.link, textClassName({ size: "sm", weight: "medium" }), className)}
			{...props}
		/>
	)
}

export interface NavigationMenuContentProps extends NavigationMenuPrimitive.Content.Props {}

/**
 * One entry's panel content, drawn into the bar's shared panel while its entry is open.
 * Placement belongs to the panel, so it is set on `NavigationMenu`, not here.
 */
export function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
	return (
		<NavigationMenuPrimitive.Content
			data-slot="navigation-menu-content"
			className={cx("navigation-menu-content--component", styles.content, className)}
			{...props}
		/>
	)
}

/**
 * The caret inside a trigger. It tells an entry that opens a panel from a link that goes
 * somewhere, and turns over while its panel is open. Renders a chevron; children replace it.
 */
export function NavigationMenuIndicator({ className, children, ...props }: NavigationMenuPrimitive.Icon.Props) {
	return (
		<NavigationMenuPrimitive.Icon
			data-slot="navigation-menu-indicator"
			className={cx("navigation-menu-indicator--component", styles.indicator, className)}
			{...props}
		>
			{children ?? <ChevronDownIcon />}
		</NavigationMenuPrimitive.Icon>
	)
}
