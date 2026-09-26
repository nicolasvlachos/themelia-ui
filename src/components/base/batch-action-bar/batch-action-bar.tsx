/**
 * BatchActionBar — the bar shown once a selection exists: a count, actions, a way out.
 * Shared by several features, so it lives in base. `placement`: `floating` docks to the
 * viewport for long lists; `inline` stays in flow inside a panel that scrolls its own body.
 */
import type { ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { Text } from "@/components/base/typography"
import type { StringsProp } from "@/lib/strings"
import { cx } from "@/lib/cx"

import { defaultBatchActionBarStrings, type BatchActionBarStrings } from "./batch-action-bar.strings"
import styles from "./batch-action-bar.module.css"

export type BatchActionBarPlacement = "floating" | "inline"

export interface BatchActionBarProps {
	/** The bar renders nothing at zero, so a caller can mount it unconditionally. */
	selectedCount: number
	/** Optional denominator for the summary. Omit when the total is unknown or unbounded. */
	totalCount?: number
	/** Omit to render no clear control — a selection the user cannot drop needs a reason. */
	onClear?: () => void
	/** `floating` docks to the bottom centre of the viewport; `inline` sits in flow. */
	placement?: BatchActionBarPlacement
	strings?: StringsProp<BatchActionBarStrings>
	/** The bulk actions. Buttons, a menu, whatever the surface needs. */
	children?: ReactNode
	className?: string
}

export function BatchActionBar({
	selectedCount,
	totalCount,
	onClear,
	placement = "floating",
	strings,
	children,
	className,
}: BatchActionBarProps) {
	const copy = { ...defaultBatchActionBarStrings, ...strings }

	// Nothing selected, nothing rendered.
	if (selectedCount <= 0) return null

	return (
		<div
			// A named region, so screen reader users can find the bar again after the list.
			role="region"
			aria-label={copy.label}
			data-slot="batch-action-bar"
			data-placement={placement}
			className={cx("batch-action-bar--component", styles.root, styles[placement], className)}
		>
			<Text size="sm" className={cx("batch-action-bar--summary", styles.summary)}>
				{copy.summary(selectedCount, totalCount)}
			</Text>
			<div className={cx("batch-action-bar--actions", styles.actions)}>
				{children}
				{onClear ? (
					<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onClear}>
						{copy.clear}
					</Button>
				) : null}
			</div>
		</div>
	)
}
