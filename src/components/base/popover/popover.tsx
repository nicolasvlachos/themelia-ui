import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import * as React from "react"

import { Slot } from "@/components/base/slot"
import { cx } from "@/lib/cx"
import { renderWithChildren } from "@/lib/render-with-children"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"
import { Text, textClassName } from "@/components/base/typography"

import styles from "./popover.module.css"

// A `PopoverAnchor` registers here, so the positioner places the popup against it, not the trigger.
const PopoverAnchorContext = React.createContext<{
	anchor: Element | null
	setAnchor: (element: Element | null) => void
} | null>(null)

interface PopoverProps extends PopoverPrimitive.Root.Props, Pick<PopoverPrimitive.Root.Props, "onOpenChange"> {}

/**
 * The root: holds the open state its trigger and panel share. `onOpenChange` receives Base
 * UI's `eventDetails`, which says what an outside interaction does: `eventDetails.reason` is
 * `"outside-press"`, and `eventDetails.cancel()` keeps the panel open through a click that
 * belongs to it.
 */
function Popover({ ...props }: PopoverProps) {
	const [anchor, setAnchor] = React.useState<Element | null>(null)
	const value = React.useMemo(() => ({ anchor, setAnchor }), [anchor])
	return (
		<PopoverAnchorContext.Provider value={value}>
			<PopoverPrimitive.Root data-slot="popover" {...props} />
		</PopoverAnchorContext.Provider>
	)
}

/**
 * Whether the element a trigger becomes is a real `button`. Base UI adds `type="button"`
 * when `nativeButton` is true, which on an `<a>` is a MIME-type hint.
 */
function inferNativeButton(element: unknown): boolean {
	if (!React.isValidElement(element)) return true
	if (typeof element.type === "string") return element.type === "button"
	const elementProps = (element.props ?? {}) as Record<string, unknown>
	return !("href" in elementProps)
}

/**
 * What opens the panel. It is separate from `PopoverAnchor`, so a toolbar button can open a
 * panel anchored to the thing it acts on.
 */
function PopoverTrigger({
	nativeButton,
	render,
	children,
	...props
}: PopoverPrimitive.Trigger.Props & {
	/**
	 * Whether the element the trigger renders is a real `<button>`. Inferred from `render`
	 * when omitted: an element with an `href` is not, so a link keeps its semantics.
	 */
	nativeButton?: boolean
}) {
	const safeRender: PopoverPrimitive.Trigger.Props["render"] =
		typeof render === "function"
			? (renderProps, state) => {
					const { nativeButton: _nativeButton, ...rest } = renderProps as Record<string, unknown>
					void _nativeButton
					return render(rest as typeof renderProps, state)
				}
			: render

	const resolvedNativeButton = nativeButton ?? inferNativeButton(render)

	return (
		<PopoverPrimitive.Trigger
			data-slot="popover-trigger"
			render={safeRender}
			nativeButton={resolvedNativeButton}
			{...props}
		>
			{children}
		</PopoverPrimitive.Trigger>
	)
}

/**
 * What the panel points at, when that is not what opens it: a panel opened by a toolbar
 * button but anchored to the selection it acts on, or opened by a row's menu and anchored
 * to the row.
 */
function PopoverAnchor({
	render,
	children,
	...props
}: React.ComponentPropsWithoutRef<"span"> & {
	/** The element this anchor becomes, in place of a `span`; `children` stays the content. */
	render?: React.ReactElement
}) {
	const registry = React.useContext(PopoverAnchorContext)
	const setAnchor = registry?.setAnchor
	const ref = React.useCallback((node: Element | null) => setAnchor?.(node), [setAnchor])
	if (render) {
		return (
			<Slot ref={ref} data-slot="popover-anchor" {...props}>
				{renderWithChildren(render, children)}
			</Slot>
		)
	}
	return (
		<span ref={ref} data-slot="popover-anchor" {...props}>
			{children}
		</span>
	)
}

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
	Pick<PopoverPrimitive.Popup.Props, "initialFocus" | "finalFocus"> &
	Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
		/**
		 * Keeps the panel in place in the DOM. Portalling is the default because an ancestor
		 * that clips or transforms would otherwise cut the panel off.
		 */
		disablePortal?: boolean
		/**
		 * The panel's own inset. `flush` drops it for content that draws its own edges — a
		 * calendar, a list that runs to the border.
		 */
		inset?: "padded" | "flush"
		/**
		 * Surface width: a CSS length, `"trigger"` to match the control it opened from — what a
		 * select-like panel wants — or `"auto"` to size to the content, capped by the space
		 * actually available. Defaults to a fixed reading width. Same vocabulary as
		 * DropdownMenuContent.
		 */
		width?: string | number | "auto" | "trigger"
		/** Floor for the width. */
		minWidth?: string | number
		/** Ceiling for `width="auto"`. Defaults to the space actually available. */
		maxWidth?: string | number
		/** Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's own. */
		container?: UIPortalContainer
	}

/**
 * The panel. It sits against its anchor at `side` and `align`, and flips when the chosen
 * side has no room; `sideOffset` and `alignOffset` are the gap to the anchor along each
 * axis. `initialFocus` and `finalFocus`, from Base UI's popup, decide where focus lands on
 * open and returns on close; `false` leaves it where it is.
 */
function PopoverContent({
	container,
	className,
	align = "center",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	disablePortal = false,
	inset = "padded",
	width,
	minWidth,
	maxWidth,
	style,
	...props
}: PopoverContentProps) {
	const portalContainer = useUIPortalContainer(container)
	const anchor = React.useContext(PopoverAnchorContext)?.anchor

	const size = (value: string | number | undefined) =>
		typeof value === "number" ? `${value}px` : value

	const widthStyle =
		width === "auto"
			? { width: "max-content", maxWidth: size(maxWidth) ?? "var(--available-width)" }
			: width === "trigger"
				? { width: "var(--anchor-width)" }
				: width != null
					? { width: size(width) }
					: {}

	const content = (
		<PopoverPrimitive.Positioner
			anchor={anchor ?? undefined}
			align={align}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			className={styles.positioner}
		>
			<PopoverPrimitive.Popup
				data-slot="popover-content"
				className={cx(
					"popover-content--component",
					styles.content,
					inset === "flush" && styles.insetFlush,
					textClassName({ size: "sm" }),
					className,
				)}
				style={{
					...widthStyle,
					...(minWidth != null && { minWidth: size(minWidth) }),
					...(maxWidth != null && width !== "auto" && { maxWidth: size(maxWidth) }),
					/* The caller's style merges last (destructured, so `props` cannot replace this object). */
					...style,
				}}
				{...props}
			/>
		</PopoverPrimitive.Positioner>
	)

	if (disablePortal) {
		return content
	}

	return <PopoverPrimitive.Portal container={portalContainer}>{content}</PopoverPrimitive.Portal>
}

/** The band at the top of the panel, for its title and description. */
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="popover-header"
			className={cx("popover-header--component", styles.header, textClassName({ size: "sm" }), className)}
			{...props}
		/>
	)
}

/**
 * The panel's heading, wired to its accessible name. Without a title and description the
 * panel announces as an unnamed group.
 */
function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
	return (
		<PopoverPrimitive.Title
			data-slot="popover-title"
			className={cx("popover-title--component", textClassName({ size: "sm", weight: "medium" }), className)}
			{...props}
		/>
	)
}

/** Supporting text, wired to the panel's accessible description. */
function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
	return (
		<PopoverPrimitive.Description
			data-slot="popover-description"
			render={<Text tag="p" size="inherit" type="secondary" />}
			className={cx("popover-description--component", styles.description, className)}
			{...props}
		/>
	)
}

/** The band at the bottom of the panel, for its actions. */
function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="popover-footer" className={cx("popover-footer--component", styles.footer, className)} {...props} />
}

export {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverFooter,
	PopoverTitle,
	PopoverTrigger,
}
