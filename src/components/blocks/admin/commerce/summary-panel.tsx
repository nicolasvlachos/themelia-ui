/**
 * The money ledger most commerce surfaces share: a tinted block of label/amount rows with
 * one emphasised total. `AmountRow` is not InlineStat: it knows deductions (U+2212) and totals.
 */
import type { ComponentProps, ReactNode } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { formatDeduction } from "./format-amount"
import styles from "./commerce.module.css"

export interface AmountRowProps extends Omit<ComponentProps<"div">, "children"> {
	/** What the amount is — "Subtotal", "Shipping". */
	label: ReactNode
	/** Already formatted, including its currency. */
	amount: string
	/** Marks the row the eye should land on — a total, an amount due. */
	total?: boolean
	/**
	 * Money coming off the total. Rewrites the sign to U+2212 whatever the caller passed,
	 * and tints the figure.
	 */
	deduction?: boolean
	/** A rate, a qualifier — sits quietly beside the label. */
	note?: ReactNode
}

/**
 * The ledger row every money surface is built from, inside a `SummaryPanel`. Not
 * InlineStat: this one knows about money — deductions and totals — and InlineStat displays
 * any value.
 */
export function AmountRow({
	label,
	amount,
	total = false,
	deduction = false,
	note,
	className,
	...props
}: AmountRowProps) {
	return (
		<div
			data-total={total ? "" : undefined}
			data-deduction={deduction ? "" : undefined}
			className={cx("amount-row--component", styles.amountRow, className)}
			{...props}
		>
			<Text
				tag="span"
				type={total ? "main" : "secondary"}
				weight={total ? "semibold" : "normal"}
				className={styles.amountLabel}
			>
				{label}
			</Text>
			{/* Always rendered; when empty, CSS hides it and collapses the note column. */}
			<Text tag="span" size="xs" type="secondary" className={styles.amountNote}>
				{note}
			</Text>
			<Text
				tag="span"
				numeric
				/* Money coming off a total reads as a gain to whoever is paying. */
				type={deduction ? "success" : "main"}
				weight={total ? "bold" : "medium"}
				className={cx("amount-row--value", styles.amountValue)}
			>
				{deduction ? formatDeduction(amount) : amount}
			</Text>
		</div>
	)
}

export interface SummaryPanelProps extends ComponentProps<"div"> {
	/** A quieter ground than the card it sits in, so the rows read as a sub-total block. */
	children: ReactNode
}

/**
 * The money ledger — the shape almost every commerce surface is made of: a tinted block of
 * label/amount rows, a rule, and one row that matters more than the rest. A cart, a tax
 * breakdown, an invoice and a subscription all draw it, and each rebuilding it inline is how
 * one of them ends up emphasising its total differently from the others.
 */
export function SummaryPanel({ children, className, ...props }: SummaryPanelProps) {
	return (
		<div className={cx("summary-panel--component", styles.summaryPanel, className)} {...props}>
			{children}
		</div>
	)
}
