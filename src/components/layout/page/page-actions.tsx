/**
 * PageActions: the page header's action ribbon, as `ActionDefinition` data. Decides which
 * actions are buttons and which collapse into a menu. Links go through `renderLink`.
 */
import { useEffect, useMemo, useState } from "react"

import {
	ActionButtons, ActionMenu, splitActions,
	type ActionDefinition, type ActionLinkRenderer, type ActionPlacement,
} from "@/components/base/action-menu"
import { cx } from "@/lib/cx"
import { BREAKPOINT_MIN_WIDTH } from "@/lib/responsive"

import { type LayoutNavigationAdapter } from "../layout.types"
import styles from "./page.module.css"
import { defaultPageActionsStrings, type PageActionsStrings } from "./page-actions.strings"

/** How the set is presented. */
export type PageActionsDisplay = "inline" | "menu" | "auto"

export interface PageAction extends ActionDefinition {
	/**
	 * Forces one entry to a side of the split: `menu` always overflows, `inline` is pinned
	 * as a button, `auto` lets `maxInlineActions` decide.
	 */
	placement?: ActionPlacement
}

export interface PageActionsProps extends LayoutNavigationAdapter {
	actions?: readonly PageAction[]
	/**
	 * `auto` watches the width and collapses everything into a menu below `breakpoint`;
	 * `inline` and `menu` are the two fixed ends.
	 */
	display?: PageActionsDisplay
	/** Viewport width, in px, below which `auto` collapses to a menu. Defaults to the `lg` breakpoint. */
	breakpoint?: number
	/** How many entries render as buttons before the rest overflow. */
	maxInlineActions?: number
	strings?: Partial<PageActionsStrings>
	className?: string
}

export function PageActions({
	actions,
	display = "auto",
	breakpoint = BREAKPOINT_MIN_WIDTH.lg,
	maxInlineActions = 3,
	strings,
	renderLink,
	className,
}: PageActionsProps) {
	const copy = { ...defaultPageActionsStrings, ...strings }

	/* Adapts the layout link renderer (children required) to the action one (optional). */
	const link: ActionLinkRenderer | undefined = renderLink
		? (props) => renderLink({ ...props, children: props.children ?? null }) as ReturnType<ActionLinkRenderer>
		: undefined

	const visible = useMemo(
		() => (actions ?? []).filter((action) => action.visible !== false),
		[actions],
	)

	/* Viewport width, not a container query: the header spans the viewport. Only `auto` subscribes. */
	const [isNarrow, setIsNarrow] = useState(false)
	useEffect(() => {
		if (display !== "auto" || typeof window === "undefined") return undefined
		// Below, not at: a CSS min-width breakpoint already counts its own width as the wider side.
		const check = () => setIsNarrow(window.innerWidth < breakpoint)
		check()
		window.addEventListener("resize", check)
		return () => window.removeEventListener("resize", check)
	}, [display, breakpoint])

	if (visible.length === 0) return null

	if (display === "menu" || (display === "auto" && isNarrow)) {
		return (
			<div className={cx("page-actions--component", styles.actions, className)}>
				<ActionMenu
					actions={visible}
					strings={{ trigger: copy.menuLabel }}
					align="end"
					preserveOrder
					renderLink={link}
				/>
			</div>
		)
	}

	// The kit's shared split rule.
	const { inline, overflow } = splitActions(visible, maxInlineActions)

	return (
		<div className={cx("page-actions--component", styles.actions, className)}>
			<ActionButtons actions={inline} renderLink={link} />
			{overflow.length > 0 && (
				<ActionMenu
					actions={overflow}
					strings={{ trigger: copy.menuLabel }}
					align="end"
					preserveOrder
					renderLink={link}
				/>
			)}
		</div>
	)
}
