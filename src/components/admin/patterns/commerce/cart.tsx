/** The checkout surfaces. All share `SummaryPanel` / `AmountRow`, so totals read the same everywhere. */
import { CheckIcon, GiftIcon, ReceiptIcon, ShoppingBagIcon, TagIcon, TicketIcon, XIcon } from "lucide-react"
import { useState } from "react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { ContentBlock, IconBadge, Separator } from "@/components/base/display"
import { FormField } from "@/components/base/forms"
import {
	Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { Stack } from "@/components/base/structure"
import { Input } from "@/components/base/text-inputs"
import { Text } from "@/components/base/typography"
import { Initials } from "@/components/primitives"
import { cx } from "@/lib/cx"

import {
	defaultCartStrings, defaultDiscountCodeStrings, defaultDiscountStackStrings,
	defaultGiftCodeStrings, defaultTaxBreakdownStrings,
	type CartStrings, type CodeEntryStrings, type DiscountStackStrings, type TaxBreakdownStrings,
} from "./commerce.strings"
import { AmountRow, SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/* ══ CartSummary ═══════════════════════════════════════════════════════════════════ */

export interface CartLine {
	id: string
	title: string
	/** The chosen option — "Large / Blue". */
	variantTitle?: string
	quantity: number
	/** Already formatted, including its currency. */
	price: string
	imageSrc?: string
	imageAlt?: string
}

function CartThumbnail({ line }: { line: CartLine }) {
	const [failed, setFailed] = useState(false)
	return line.imageSrc && !failed ? (
		<img src={line.imageSrc} alt={line.imageAlt ?? line.title} onError={() => setFailed(true)} />
	) : (
		<span className={styles.cartThumb} aria-hidden="true"><Initials value={line.title} /></span>
	)
}

export interface CartSummaryProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	items: CartLine[]
	/** Every amount is already formatted — this block totals nothing itself. */
	subtotal?: string
	tax?: string
	shipping?: string
	/** Rendered as a deduction, with the sign rewritten. */
	discount?: string
	total: string
	onCheckout?: () => void
	strings?: Partial<CartStrings>
}

export function CartSummary({
	items,
	subtotal,
	tax,
	shipping,
	discount,
	total,
	onCheckout,
	strings,
	className,
	...props
}: CartSummaryProps) {
	const copy = { ...defaultCartStrings, ...strings }
	const hasBreakdown = Boolean(subtotal || tax || shipping || discount)

	return (
		<ContentBlock
			icon={<ShoppingBagIcon aria-hidden="true" />}
			title={copy.title}
			className={cx("cart-summary--component", styles.block, className)}
			{...props}
		>
			{/* Ruled, so the lines read as one basket. */}
			<ItemGroup ruled>
				{items.map((line) => (
					<Item key={line.id} className={styles.commerceLine}>
						<ItemMedia variant="image" className={styles.summaryLineMedia}>
							<CartThumbnail key={line.imageSrc} line={line} />
						</ItemMedia>
						<ItemContent className={styles.summaryLineBody}>
							<ItemTitle className={styles.summaryLineTitle}>{line.title}</ItemTitle>
							<Stack direction="horizontal" align="baseline" wrap gap="sm">
								{line.variantTitle && <ItemDescription>{line.variantTitle}</ItemDescription>}
								<Text tag="span" size="xs" type="secondary" numeric>{copy.formatQuantity(line.quantity)}</Text>
							</Stack>
						</ItemContent>
						<ItemContent className={styles.summaryLinePrice}>
							<Text tag="span" weight="semibold" numeric>{line.price}</Text>
						</ItemContent>
					</Item>
				))}
			</ItemGroup>

			<SummaryPanel>
				{subtotal != null && <AmountRow label={copy.subtotal} amount={subtotal} />}
				{tax != null && <AmountRow label={copy.tax} amount={tax} />}
				{shipping != null && <AmountRow label={copy.shipping} amount={shipping} />}
				{discount != null && <AmountRow label={copy.discount} amount={discount} deduction />}
				<AmountRow label={copy.total} amount={total} total className={hasBreakdown ? styles.summaryRollup : undefined} />
			</SummaryPanel>

			{onCheckout && (
				<Button fullWidth onClick={onCheckout}>
					{copy.checkout}
				</Button>
			)}
		</ContentBlock>
	)
}

/* ══ TaxBreakdown ══════════════════════════════════════════════════════════════════ */

export interface TaxLine {
	id?: string
	label: string
	/** The rate as written — "20%", "7.5%". Sits quietly beside the label. */
	rate?: string
	amount: string
}

export interface TaxBreakdownProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	subtotal: string
	taxes: TaxLine[]
	/** The rollup. Only worth drawing when there is more than one line to roll up. */
	totalTax?: string
	total: string
	strings?: Partial<TaxBreakdownStrings>
}

export function TaxBreakdown({
	subtotal,
	taxes,
	totalTax,
	total,
	strings,
	className,
	...props
}: TaxBreakdownProps) {
	const copy = { ...defaultTaxBreakdownStrings, ...strings }

	return (
		<ContentBlock
			icon={<ReceiptIcon aria-hidden="true" />}
			title={copy.title}
			className={cx("tax-breakdown--component", styles.block, className)}
			{...props}
		>
			<SummaryPanel>
				<AmountRow label={copy.subtotal} amount={subtotal} />
				{taxes.map((tax, index) => (
					<AmountRow
						key={tax.id ?? `${tax.label}-${index}`}
						label={tax.label}
						note={tax.rate}
						amount={tax.amount}
					/>
				))}
				{/* One tax line IS the total tax; a rollup under it would restate the row above. */}
				{totalTax != null && taxes.length > 1 && (
					<AmountRow label={copy.totalTax} amount={totalTax} />
				)}
				<AmountRow label={copy.total} amount={total} total className={styles.summaryRollup} />
			</SummaryPanel>
		</ContentBlock>
	)
}

/* ══ DiscountStack ═════════════════════════════════════════════════════════════════ */

export interface Discount {
	id?: string
	label: string
	/**
	 * What kind of discount it is — "Code", "Automatic", "Volume".
	 *
	 * Rendered as a quiet qualifier beside the label, not as a chip. A Badge here was the
	 * first thing tried and it failed contrast at 3.45:1 in the dark theme: a chip is drawn
	 * to sit on a card, and the ledger it lands in has its own tinted ground under it.
	 */
	kind?: ReactNode
	amount: string
}

export interface DiscountStackProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	/** In the order they stack, because order changes the arithmetic. */
	discounts: Discount[]
	totalSavings: string
	strings?: Partial<DiscountStackStrings>
}

export function DiscountStack({
	discounts,
	totalSavings,
	strings,
	className,
	...props
}: DiscountStackProps) {
	const copy = { ...defaultDiscountStackStrings, ...strings }

	return (
		<ContentBlock
			icon={<TagIcon aria-hidden="true" />}
			title={copy.title}
			className={cx("discount-stack--component", styles.block, className)}
			{...props}
		>
			<SummaryPanel>
				{discounts.map((discount, index) => (
					<AmountRow
						key={discount.id ?? `${discount.label}-${index}`}
						label={discount.label}
						note={discount.kind}
						amount={discount.amount}
						deduction
					/>
				))}
			</SummaryPanel>

			<Separator />
			<AmountRow label={copy.totalSavings} amount={totalSavings} total deduction />
		</ContentBlock>
	)
}

/* ══ CodeEntry ════════════════════════════════════════════════════════════════════ */

/**
 * CodeEntry — a discount code or a gift card.
 *
 * These were two components, and they were the same component twice: a title, a field, a
 * button, and an applied state. The only real difference is that a gift card holds a
 * BALANCE — money that may outlast this order — where a discount either applies or does
 * not. That is one optional prop, not a second component.
 *
 * `kind` picks the preset: the icon, the default copy, and whether the code is upper-cased
 * on submit. Gift card codes are printed in capitals and nobody types them that way.
 */
export type CodeEntryKind = "discount" | "gift"

export interface CodeEntryProps
	extends Omit<ComponentProps<typeof ContentBlock>, "children" | "onSubmit"> {
	kind?: CodeEntryKind
	/** The code in force. Present switches the card to its applied state. */
	appliedCode?: string
	/** What it took off, already formatted. */
	appliedDiscount?: string
	/** What is left on the card, already formatted. Gift cards only. */
	balance?: string
	/** A rejection message, shown under the field. */
	error?: string
	loading?: boolean
	onApply?: (code: string) => void
	onRemove?: () => void
	strings?: Partial<CodeEntryStrings>
}

export function CodeEntry({
	kind = "discount",
	appliedCode,
	appliedDiscount,
	balance,
	error,
	loading = false,
	onApply,
	onRemove,
	strings,
	className,
	...props
}: CodeEntryProps) {
	const copy = { ...(kind === "gift" ? defaultGiftCodeStrings : defaultDiscountCodeStrings), ...strings }
	const [code, setCode] = useState("")

	return (
		<ContentBlock
			icon={kind === "gift" ? <GiftIcon aria-hidden="true" /> : <TicketIcon aria-hidden="true" />}
			title={copy.title}
			description={copy.helperText}
			className={cx("code-entry--component", styles.block, className)}
			{...props}
		>
			{appliedCode != null ? (
				<>
					<div className={styles.couponApplied}>
						{/*
						 * The kit's medallion, solid: a tick that has to be found at a glance on a
						 * tinted panel. The local copy was the same ten lines and the same size
						 * expression under a different name.
						 */}
						<IconBadge icon={CheckIcon} tone="success" shape="circle" solid aria-hidden="true" />
						<span className={styles.couponAppliedBody}>
							<Text tag="span" weight="semibold" className={styles.couponCode}>
								{appliedCode}
							</Text>
							<Text tag="span" size="xs" type="secondary">
								{copy.applied}
							</Text>
						</span>
						{appliedDiscount != null && (
							<Text tag="span" type="success" numeric weight="bold" className={styles.couponAmount}>
								{appliedDiscount}
							</Text>
						)}
						{onRemove && (
							<Button
								tone="secondary"
								buttonStyle="ghost"
								onClick={onRemove}
								disabled={loading}
								aria-label={copy.remove}
								iconOnly
							>
								<XIcon aria-hidden="true" />
							</Button>
						)}
					</div>
					{/* A gift card's balance outlives this order, so it is stated separately. */}
					{balance != null && (
						<SummaryPanel>
							<AmountRow label={copy.balance} amount={balance} total />
						</SummaryPanel>
					)}
				</>
			) : (
				/*
				 * A form, so Enter submits. A code field where the keyboard does nothing and
				 * only the button works is the commonest way this control gets built wrong.
				 */
				<form
					className={styles.couponForm}
					onSubmit={(event) => {
						event.preventDefault()
						const trimmed = kind === "gift" ? code.trim().toUpperCase() : code.trim()
						if (trimmed && !loading) onApply?.(trimmed)
					}}
				>
					{/*
					 * The field is named on the control, not by a visible label: the card's own
					 * title already says what this is, and a placeholder is not an accessible
					 * name — it is unreliably announced and gone the moment anyone types.
					 */}
					<FormField error={error} className={styles.couponField}>
						<Input
							value={code}
							disabled={loading}
							placeholder={copy.placeholder}
							aria-label={copy.fieldLabel}
							onChange={(event) => setCode(event.target.value)}
							invalid={Boolean(error)}
						/>
					</FormField>
					<Button type="submit" loading={loading} disabled={!code.trim()}>
						{copy.apply}
					</Button>
				</form>
			)}
		</ContentBlock>
	)
}
