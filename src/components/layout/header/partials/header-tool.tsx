/** HeaderToolButton and HeaderToolPopover: the icon controls in a header's right cluster, one shape for all. */
import { forwardRef } from "react"

import { Button } from "@/components/base/buttons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { cx } from "@/lib/cx"

import type { HeaderToolButtonProps, HeaderToolPopoverProps } from "../header.types"
import styles from "../header.module.css"

export const HeaderToolButton = forwardRef<HTMLButtonElement, HeaderToolButtonProps>(
	function HeaderToolButton(
		{ label, icon: Icon, active = false, disabled = false, badge, onClick, className },
		ref,
	) {
		return (
			<Button
				ref={ref}
				type="button"
				data-slot="header-tool-button"
				tone="neutral"
				buttonStyle="ghost"
				iconOnly
				aria-label={label}
				/* Only when engaged; otherwise a plain button would announce "not pressed". */
				aria-pressed={active || undefined}
				disabled={disabled}
				onClick={onClick}
				className={cx("header-tool-button--component", styles.tool, className)}
			>
				<Icon aria-hidden />
				{badge !== undefined && badge !== null && badge !== false && (
					/* Hidden: the control's accessible name states the count. */
					<span aria-hidden data-slot="header-tool-badge" className={styles.toolBadge}>
						{badge}
					</span>
				)}
			</Button>
		)
	},
)

/** The same control with a surface hanging off it. */
export function HeaderToolPopover({
	label,
	icon,
	open,
	defaultOpen,
	onOpenChange,
	active,
	disabled,
	badge,
	align = "end",
	side = "bottom",
	sideOffset,
	className,
	triggerClassName,
	contentClassName,
	children,
}: HeaderToolPopoverProps) {
	return (
		<Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger
				render={
					<HeaderToolButton
						label={label}
						icon={icon}
						// Open is engaged, unless the caller says otherwise.
						active={active ?? open}
						disabled={disabled}
						badge={badge}
						className={triggerClassName}
					/>
				}
			/>
			<PopoverContent
				data-slot="header-tool-popover"
				align={align}
				side={side}
				sideOffset={sideOffset}
				className={cx("header-tool-popover--component", styles.toolSurface, className, contentClassName)}
			>
				{children}
			</PopoverContent>
		</Popover>
	)
}
