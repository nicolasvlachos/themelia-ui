/**
 * Invoices: the header, the lines, and the list tile. The status chip's tone comes from the
 * status, with no override. `InvoiceLineItems` takes numbers: it is the one commerce
 * surface that does arithmetic, rendering through the Money primitive.
 */
import { FileTextIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/base/item"
import { ContentBlock } from "@/components/base/display"
import {
	Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/base/table"
import { DisplayLabel, Text } from "@/components/base/typography"
import { Money, MonoValue, Percent } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultInvoiceStrings, type InvoiceStrings } from "./commerce.strings"
import { INVOICE_STATUS_TONE, type InvoiceStatus } from "./commerce.types"
import { AmountRow, SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/* ══ InvoiceHeader ═════════════════════════════════════════════════════════════════ */

export interface InvoiceParty {
	name: string
	/** A city, a country — whatever identifies the party beyond its name. */
	location?: ReactNode
}

export interface InvoiceHeaderProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	invoiceNumber: string
	status: InvoiceStatus
	from: InvoiceParty
	to: InvoiceParty
	/** Already formatted. */
	issuedAt?: string
	dueAt?: string
	/** Already formatted, including its currency. */
	amountDue: string
	strings?: Partial<InvoiceStrings>
}

export function InvoiceHeader({
	invoiceNumber,
	status,
	from,
	to,
	issuedAt,
	dueAt,
	amountDue,
	strings,
	className,
	...props
}: InvoiceHeaderProps) {
	const copy = { ...defaultInvoiceStrings, ...strings }

	return (
		<ContentBlock
			icon={<FileTextIcon aria-hidden="true" />}
			title={copy.title}
			titleSuffix={<Badge tone={INVOICE_STATUS_TONE[status]}>{copy[status]}</Badge>}
			description={<MonoValue>{invoiceNumber}</MonoValue>}
			className={cx("invoice-header--component", styles.block, className)}
			{...props}
		>
			<div className={styles.invoiceParties}>
				{[
					{ heading: copy.billFrom, party: from },
					{ heading: copy.billTo, party: to },
				].map(({ heading, party }) => (
					<div key={heading} className={styles.orderFact}>
						<DisplayLabel>{heading}</DisplayLabel>
						<Text weight="semibold">{party.name}</Text>
						{party.location != null && (
							<Text size="xs" type="secondary">
								{party.location}
							</Text>
						)}
					</div>
				))}
			</div>

			<SummaryPanel>
				{issuedAt != null && <AmountRow label={copy.issued} amount={issuedAt} />}
				{dueAt != null && <AmountRow label={copy.due} amount={dueAt} />}
				<AmountRow label={copy.amountDue} amount={amountDue} total />
			</SummaryPanel>
		</ContentBlock>
	)
}

/* ══ InvoiceLineItems ══════════════════════════════════════════════════════════════ */

export interface InvoiceLine {
	id?: string
	description: string
	quantity: number
	/** A number, not a string — the table totals these. */
	unitPrice: number
}

export interface InvoiceLineItemsProps extends Omit<ComponentProps<"div">, "children"> {
	lines: InvoiceLine[]
	/** ISO 4217. Handed to the Money primitive, which knows each currency's exponent. */
	currency?: string
	/** A ratio — `0.2` is 20%. Omit to show no tax row. */
	taxRate?: number
	strings?: Partial<InvoiceStrings>
}

export function InvoiceLineItems({
	lines,
	currency,
	taxRate,
	strings,
	className,
	...props
}: InvoiceLineItemsProps) {
	const copy = { ...defaultInvoiceStrings, ...strings }

	const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
	const tax = taxRate != null ? subtotal * taxRate : null
	const total = subtotal + (tax ?? 0)

	return (
		<div className={cx("invoice-line-items--component", styles.invoiceLines, className)} {...props}>
			<div className={styles.invoiceTable}>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{copy.item}</TableHead>
						<TableHead align="end">{copy.quantity}</TableHead>
						<TableHead align="end">{copy.price}</TableHead>
						<TableHead align="end">{copy.amount}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{lines.map((line, index) => (
						<TableRow key={line.id ?? `${line.description}-${index}`}>
							<TableCell>{line.description}</TableCell>
							<TableCell align="end">
								{/* Tabular figures come from Text, not the cell — a quantity is a figure. */}
								<Text tag="span" numeric>
									{line.quantity}
								</Text>
							</TableCell>
							<TableCell align="end">
								<Money amount={line.unitPrice} currency={currency} />
							</TableCell>
							<TableCell align="end">
								<Money amount={line.quantity * line.unitPrice} currency={currency} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={3} align="end">
							{copy.subtotal}
						</TableCell>
						<TableCell align="end">
							<Money amount={subtotal} currency={currency} />
						</TableCell>
					</TableRow>
					{tax !== null && (
						<TableRow>
							<TableCell colSpan={3} align="end">
								{copy.tax} <Percent value={taxRate!} />
							</TableCell>
							<TableCell align="end">
								<Money amount={tax} currency={currency} />
							</TableCell>
						</TableRow>
					)}
					<TableRow>
						<TableCell colSpan={3} align="end">
							<Text tag="span" weight="semibold">
								{copy.total}
							</Text>
						</TableCell>
						<TableCell align="end">
							<Money amount={total} currency={currency} weight="bold" />
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
			</div>
			<div className={styles.invoiceMobile}>
				<ItemGroup ruled>
					{lines.map((line, index) => (
						<Item key={line.id ?? `${line.description}-${index}`}>
							<ItemContent>
								<ItemTitle>{line.description}</ItemTitle>
								<ItemDescription>
									<Text tag="span" size="inherit" type="inherit" numeric>{line.quantity}</Text>
									{" × "}<Money amount={line.unitPrice} currency={currency} size="inherit" type="inherit" />
								</ItemDescription>
							</ItemContent>
							<ItemActions><Money amount={line.quantity * line.unitPrice} currency={currency} weight="semibold" /></ItemActions>
						</Item>
					))}
				</ItemGroup>
				<SummaryPanel>
					{[
						{ label: copy.subtotal, amount: subtotal },
						...(tax !== null ? [{ label: <>{copy.tax} <Percent value={taxRate!} /></>, amount: tax }] : []),
						{ label: copy.total, amount: total, total: true },
					].map((row, index) => (
						<div key={index} className={cx(styles.amountRow, row.total && styles.summaryRollup)}>
							<Text weight={row.total ? "semibold" : "regular"} type={row.total ? "main" : "secondary"}>{row.label}</Text>
							<Money amount={row.amount} currency={currency} weight={row.total ? "bold" : "medium"} className={styles.amountValue} />
						</div>
					))}
				</SummaryPanel>
			</div>
		</div>
	)
}

/* ══ InvoiceMini ═══════════════════════════════════════════════════════════════════ */

export interface InvoiceMiniProps extends Omit<ComponentProps<"div">, "children"> {
	invoiceNumber: string
	status: InvoiceStatus
	customerName: string
	lineCount: number
	/** Already formatted. */
	dueAt: string
	/** Already formatted, including its currency. */
	total: string
	strings?: Partial<InvoiceStrings>
}

export function InvoiceMini({
	invoiceNumber,
	status,
	customerName,
	lineCount,
	dueAt,
	total,
	strings,
	className,
	...props
}: InvoiceMiniProps) {
	const copy = { ...defaultInvoiceStrings, ...strings }

	return (
		<div className={cx("invoice-mini--component", styles.invoiceMini, className)} {...props}>
			<div className={styles.invoiceMiniHead}>
				<MonoValue truncate>{invoiceNumber}</MonoValue>
				<Badge tone={INVOICE_STATUS_TONE[status]} dot>
					{copy[status]}
				</Badge>
			</div>

			<Text type="secondary" truncate>
				{customerName}
			</Text>

			<div className={styles.invoiceMiniFoot}>
				<span className={styles.invoiceMiniMeta}>
					<Text size="xs" type="secondary">
						{copy.formatLineCount(lineCount)}
					</Text>
					<Text size="xs" type="secondary" numeric>
						{dueAt}
					</Text>
				</span>
				<Text tag="span" weight="bold" numeric>
					{total}
				</Text>
			</div>
		</div>
	)
}
