/**
 * OrderTransactions: the payment ledger. Unlike `AmountRow`'s green deduction, a refund
 * here is money going out: signed from its kind, never tinted. Failed attempts stay listed.
 */
import { resolveStrings } from "@/lib/strings"
import {
	BanIcon, CreditCardIcon, DownloadIcon, RotateCcwIcon, ShieldCheckIcon, TriangleAlertIcon,
} from "lucide-react"
import type { ComponentProps } from "react"

import { Empty } from "@/components/base/feedback"
import { Badge } from "@/components/base/badge"
import { ContentBlock, IconBadge, type IconBadgeTone } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultTransactionStrings, type TransactionStrings } from "./commerce.strings"
import {
	OUTGOING_TRANSACTION_KINDS, TRANSACTION_STATUS_TONE,
	type TransactionKind, type TransactionStatus,
} from "./commerce.types"
import { MINUS_SIGN, stripLeadingMinus } from "./format-amount"
import styles from "./commerce.module.css"

/* A glyph per kind, so the ledger scans without being read. */
const KIND_ICON = {
	authorization: ShieldCheckIcon,
	capture: DownloadIcon,
	sale: CreditCardIcon,
	refund: RotateCcwIcon,
	void: BanIcon,
	chargeback: TriangleAlertIcon,
} as const

export interface Transaction {
	id: string
	kind: TransactionKind
	status: TransactionStatus
	/** The magnitude, already formatted. The sign comes from the kind. */
	amount: string
	/** Already formatted. */
	processedAt: string
	/** How it was taken — "Visa ending 4417", "PayPal". */
	method?: string
	/** The gateway's own id. Mono: it is compared and copied, not read. */
	reference?: string
	gateway?: string
}

export interface OrderTransactionsProps
	extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	transactions: Transaction[]
	strings?: Partial<TransactionStrings>
}

export function OrderTransactions({
	transactions,
	strings,
	className,
	...props
}: OrderTransactionsProps) {
	const copy = resolveStrings(defaultTransactionStrings, strings)

	return (
		<ContentBlock
			title={copy.title}
			className={cx("order-transactions--component", styles.block, className)}
			{...props}
		>
			{transactions.length === 0 ? (
				<Empty padding="sm" title={copy.empty} description={false} />
			) : (
				/* The block draws the frame; the list stays an ordered <ol>. */
				<ContentBlock surface="bordered" flush>
					<ol className={styles.transactions}>
						{transactions.map((transaction) => {
							const outgoing = OUTGOING_TRANSACTION_KINDS.has(transaction.kind)
							const amount = `${outgoing ? MINUS_SIGN : ""}${stripLeadingMinus(transaction.amount)}`

							const Icon = KIND_ICON[transaction.kind]

							/*
							 * The mark's tone is a PROP, not a rule reaching into the badge from this
							 * module. IconBadge declares its fill and its glyph as one pair so a badge
							 * cannot end up with one tone's ground and another's ink; overriding half
							 * of it from outside — which is what the local copy did — is how they come
							 * apart.
							 */
							const markTone: IconBadgeTone =
								transaction.status === "failure"
									? "destructive"
									: outgoing
										? "warning"
										: "neutral"

							return (
								<li
									key={transaction.id}
									data-status={transaction.status}
									data-outgoing={outgoing ? "" : undefined}
									className={cx("order-transactions--row", styles.transaction)}
								>
									<IconBadge icon={Icon} tone={markTone} aria-hidden="true" />

									<div className={styles.transactionBody}>
										<span className={styles.transactionHead}>
											<Text tag="span" weight="medium">
												{copy.kind[transaction.kind]}
											</Text>
											{/*
											 * Success is the expected case and needs no chip; a pending or
											 * failed one is the whole reason someone opened this list.
											 */}
											{transaction.status !== "success" && (
												/*
												 * Solid, not soft. This badge only ever appears on an exception,
												 * which is the reason someone opened the ledger — and a soft one
												 * sits translucent on the failure row's own tint, compositing to
												 * 3.7:1 in dark and 4.5 in light. An opaque ground carries its
												 * own foreground and does not care what is behind it.
												 */
												<Badge tone={TRANSACTION_STATUS_TONE[transaction.status]} variant="solid">
													{copy.status[transaction.status]}
												</Badge>
											)}
										</span>

										<span className={styles.transactionMeta}>
											<Text tag="span" size="xs" type="secondary" numeric>
												{transaction.processedAt}
											</Text>
											{transaction.method != null && (
												<Text tag="span" size="xs" type="secondary">
													{transaction.method}
												</Text>
											)}
											{transaction.gateway != null && (
												<Text tag="span" size="xs" type="secondary">
													{transaction.gateway}
												</Text>
											)}
										</span>

										{transaction.reference != null && (
											<MonoValue size="xs" type="secondary">
												{transaction.reference}
											</MonoValue>
										)}
									</div>

									<Text
										tag="span"
										weight="semibold"
										numeric
										className={styles.transactionAmount}
									>
										{amount}
									</Text>
								</li>
							)
						})}
					</ol>
				</ContentBlock>
			)}
		</ContentBlock>
	)
}
