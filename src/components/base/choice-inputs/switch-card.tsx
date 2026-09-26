/**
 * SwitchCard — a bordered settings card with icon, title, optional description and hint,
 * and a trailing switch; the whole card toggles. A preset ToggleField (`surface="card"`,
 * a switch, and an "off" value that still submits).
 */
import { forwardRef } from "react"

import { ToggleField, type ToggleFieldProps } from "./toggle-field"

export interface SwitchCardProps
	extends Omit<ToggleFieldProps, "kind" | "surface" | "controlPosition" | "uncheckedValue" | "label"> {
	/** Card title, and the switch's accessible name. */
	label: string
}

export const SwitchCard = forwardRef<HTMLDivElement, SwitchCardProps>(function SwitchCard(props, ref) {
	/* An unchecked switch submits nothing, so the card submits "0" when off. */
	return <ToggleField ref={ref} {...props} kind="switch" surface="card" uncheckedValue="0" />
})
