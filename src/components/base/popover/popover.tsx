import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import * as React from "react"

import { Slot } from "@/components/base/slot"
import { cx } from "@/lib/cx"
import { renderWithChildren } from "@/lib/render-with-children"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"
import { Text } from "@/components/base/typography"

import styles from "./popover.module.css"

// A `PopoverAnchor` registers here, so the positioner places the popup against it, not the trigger.
const PopoverAnchorContext = React.createContext<{
	anchor: Element | null
	setAnchor: (element: Element | null) => void
} | null>(null)

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
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

function PopoverTrigger({
	nativeButton,
	render,
	children,
	...props
}: PopoverPrimitive.Trigger.Props & {
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

function PopoverAnchor({
	render,
	children,
	...props
}: React.ComponentPropsWithoutRef<"span"> & {
	/** The element this anchor becomes (docs/adr/0005); `children` stays the content. */
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
	Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
		disablePortal?: boolean
		/** `flush` drops the surface padding for content that owns its own insets. */
		inset?: "padded" | "flush"
		/**
		 * Surface width: a CSS length, `"auto"` to size to the content, or `"trigger"` to match
		 * the trigger. Defaults to a fixed reading width. Same vocabulary as DropdownMenuContent.
		 */
		width?: string | number | "auto" | "trigger"
		minWidth?: string | number
		/** Ceiling for `width="auto"`. Defaults to the space actually available. */
		maxWidth?: string | number
		/** Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's own. */
		container?: UIPortalContainer
	}

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
				className={cx("popover-content--component", styles.content, inset === "flush" && styles.insetFlush, className)}
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

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="popover-header" className={cx("popover-header--component", styles.header, className)} {...props} />
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
	return (
		<PopoverPrimitive.Title
			data-slot="popover-title"
			className={cx("popover-title--component", styles.title, className)}
			{...props}
		/>
	)
}

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
