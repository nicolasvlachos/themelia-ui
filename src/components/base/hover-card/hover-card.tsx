/**
 * HoverCard — a preview that opens on hover. Unlike Tooltip it holds structure a reader
 * can move into, hence the open and close delays. Nothing inside may be the only route to
 * anything: touch has no hover.
 */
import { PreviewCard } from "@base-ui/react/preview-card"

import { cx } from "@/lib/cx"
import { useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import styles from "./hover-card.module.css"

export interface HoverCardProps extends PreviewCard.Root.Props {}

export function HoverCard(props: HoverCardProps) {
	return <PreviewCard.Root data-slot="hover-card" {...props} />
}

export interface HoverCardTriggerProps extends PreviewCard.Trigger.Props {}

/**
 * Trigger with default delays. `closeDelay` keeps the card open while the pointer crosses
 * the gap to it.
 */
export function HoverCardTrigger({ delay = 400, closeDelay = 200, ...props }: HoverCardTriggerProps) {
	return (
		<PreviewCard.Trigger
			data-slot="hover-card-trigger"
			delay={delay}
			closeDelay={closeDelay}
			{...props}
		/>
	)
}

export interface HoverCardContentProps extends PreviewCard.Popup.Props {
	/**
	 * Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's
	 * own target.
	 */
	container?: UIPortalContainer
	align?: PreviewCard.Positioner.Props["align"]
	side?: PreviewCard.Positioner.Props["side"]
	sideOffset?: PreviewCard.Positioner.Props["sideOffset"]
}

export function HoverCardContent({
	container,
	align = "center",
	side = "bottom",
	sideOffset = 8,
	className,
	...props
}: HoverCardContentProps) {
	const portalContainer = useUIPortalContainer(container)

	return (
		<PreviewCard.Portal container={portalContainer}>
			<PreviewCard.Positioner align={align} side={side} sideOffset={sideOffset} className={styles.positioner}>
				<PreviewCard.Popup
					data-slot="hover-card-content"
					className={cx("hover-card--component", styles.content, className)}
					{...props}
				/>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	)
}
