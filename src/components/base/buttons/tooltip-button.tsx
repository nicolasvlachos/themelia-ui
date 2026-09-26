/**
 * TooltipButton — a button with a tooltip. For an icon-only button the tooltip text is
 * also the accessible name, so it isn't unnamed to non-mouse users.
 */
import * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"

import { Button, type ButtonProps } from "./button"

export interface TooltipButtonProps extends ButtonProps {
	/**
	 * Shown on hover and focus. It is the accessible name only when the button has no text of
	 * its own; beside a visible label it is the description.
	 */
	tooltip: string
	/** Where the tooltip opens. */
	side?: React.ComponentProps<typeof TooltipContent>["side"]
}

export const TooltipButton = React.forwardRef<HTMLButtonElement, TooltipButtonProps>(
	function TooltipButton({ tooltip, side = "top", children, ...props }, ref) {
		return (
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							ref={ref}
							aria-label={props["aria-label"] ?? (typeof children === "string" || typeof children === "number" ? undefined : tooltip)}
							{...props}
						>
							{children}
						</Button>
					}
				/>
				<TooltipContent side={side}>{tooltip}</TooltipContent>
			</Tooltip>
		)
	},
)
