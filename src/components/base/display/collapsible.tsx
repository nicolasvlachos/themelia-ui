/** Collapsible — a disclosure that animates to its content's natural height, CSS-only (`grid-template-rows: 0fr → 1fr`). */
import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

type CollapsibleContextValue = { open: boolean; setOpen: (open: boolean) => void; id: string }
const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsible(part: string) {
	const context = React.useContext(CollapsibleContext)
	if (!context) throw new Error(`<${part}> must be used within <Collapsible>`)
	return context
}

export interface CollapsibleProps extends Omit<React.ComponentProps<"div">, "onToggle"> {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
}

export function Collapsible({
	open,
	defaultOpen = false,
	onOpenChange,
	className,
	children,
	...props
}: CollapsibleProps) {
	const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
	const isControlled = open !== undefined
	const isOpen = isControlled ? open : uncontrolled
	const id = React.useId()

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!isControlled) setUncontrolled(next)
			onOpenChange?.(next)
		},
		[isControlled, onOpenChange],
	)

	const value = React.useMemo(() => ({ open: isOpen, setOpen, id }), [isOpen, setOpen, id])

	return (
		<CollapsibleContext.Provider value={value}>
			<div
				data-slot="collapsible"
				data-open={isOpen ? "" : undefined}
				className={cx("collapsible--component", className)}
				{...props}
			>
				{children}
			</div>
		</CollapsibleContext.Provider>
	)
}

export function CollapsibleTrigger({
	className,
	children,
	onClick,
	...props
}: React.ComponentProps<"button">) {
	const { open, setOpen, id } = useCollapsible("CollapsibleTrigger")
	return (
		<button
			type="button"
			data-slot="collapsible-trigger"
			aria-expanded={open}
			aria-controls={id}
			className={cx("collapsible--trigger", styles.collapsibleTrigger, className)}
			// Small glyph, full-size target (styles/targets.css).
			data-hit-area
			onClick={(event) => {
				onClick?.(event)
				if (!event.defaultPrevented) setOpen(!open)
			}}
			{...props}
		>
			<ChevronRightIcon className={styles.collapsibleIcon} aria-hidden />
			{children}
		</button>
	)
}

export function CollapsibleContent({ className, children, ...props }: React.ComponentProps<"div">) {
	const { open, id } = useCollapsible("CollapsibleContent")
	return (
		<div
			id={id}
			data-slot="collapsible-content"
			data-open={open ? "" : undefined}
			// Collapsed content stays mounted to animate; `inert` also removes its controls from the tab order.
			aria-hidden={!open}
			inert={!open}
			className={cx("collapsible--content", styles.collapsibleContent, className)}
			{...props}
		>
			<div className={styles.collapsibleInner}>{children}</div>
		</div>
	)
}
