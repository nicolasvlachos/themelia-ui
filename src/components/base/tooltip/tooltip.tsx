import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { createContext, useContext, useId, useState } from "react"

import { cx } from "@/lib/cx"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import styles from "./tooltip.module.css"

// No delay of its own: Base UI's default (600ms) applies unless the app sets one.
function TooltipProvider({
	delay,
	delayDuration,
	...props
}: TooltipPrimitive.Provider.Props & { delayDuration?: number }) {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delay={delayDuration ?? delay}
			{...props}
		/>
	)
}

/* The open tooltip's id, so its trigger can name it as a description while it is shown. */
const TooltipDescriptionContext = createContext<{ id: string; open: boolean } | null>(null)

// No provider per tooltip, so the app's `<TooltipProvider delay>` applies.
function Tooltip({ open, defaultOpen, onOpenChange, ...props }: TooltipPrimitive.Root.Props) {
	const id = useId()
	const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false)
	return (
		<TooltipDescriptionContext.Provider value={{ id, open: open ?? innerOpen }}>
			<TooltipPrimitive.Root
				data-slot="tooltip"
				open={open}
				defaultOpen={defaultOpen}
				onOpenChange={(next, details) => {
					setInnerOpen(next)
					onOpenChange?.(next, details)
				}}
				{...props}
			/>
		</TooltipDescriptionContext.Provider>
	)
}

function TooltipTrigger({
	render,
	children,
	...props
}: TooltipPrimitive.Trigger.Props) {
	const description = useContext(TooltipDescriptionContext)
	const safeRender: TooltipPrimitive.Trigger.Props["render"] =
		typeof render === "function"
			? (renderProps, state) => {
					const { nativeButton: _nativeButton, ...rest } = renderProps as Record<string, unknown>
					void _nativeButton
					return render(rest as typeof renderProps, state)
				}
			: render

	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			render={safeRender}
			{...props}
			/* While shown, the tooltip describes its trigger for screen readers too. */
			aria-describedby={
				[props["aria-describedby"], description?.open ? description.id : undefined].filter(Boolean).join(" ") || undefined
			}
		>
			{children}
		</TooltipPrimitive.Trigger>
	)
}

function TooltipContent({
	container,
	className,
	side = "top",
	/*
	 * Clears the arrow's protrusion (half its diagonal: 0.5rem × 0.707 ≈ 6px). A literal —
	 * keep in step with --tooltip-arrow-size.
	 */
	sideOffset = 6,
	align = "center",
	alignOffset = 0,
	children,
	...props
}: TooltipPrimitive.Popup.Props &
	Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
		/** Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's own. */
		container?: UIPortalContainer
	}) {
	const portalContainer = useUIPortalContainer(container)
	const description = useContext(TooltipDescriptionContext)

	return (
		<TooltipPrimitive.Portal container={portalContainer}>
			<TooltipPrimitive.Positioner
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				className={styles.positioner}
			>
				<TooltipPrimitive.Popup
					id={props.id ?? description?.id}
					data-slot="tooltip-content"
					className={cx("tooltip-content--component", styles.content, className)}
					{...props}
				>
					{children}
					<TooltipPrimitive.Arrow className={styles.arrow} />
				</TooltipPrimitive.Popup>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	)
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
