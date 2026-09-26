/** The customer's record: addresses, payment methods, subscriptions and inventory levels. */
import { CreditCardIcon, MapPinIcon, PackageIcon, RepeatIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock, IconBadge } from "@/components/base/display"
import { Progress } from "@/components/base/feedback"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	defaultAddressStrings, defaultInventoryStrings, defaultPaymentMethodStrings,
	defaultSubscriptionStrings,
	type AddressStrings, type InventoryStrings, type PaymentMethodStrings,
	type SubscriptionStrings,
} from "./commerce.strings"
import { AddressLines } from "./address-lines"
import type { AddressKind, PaymentBrand } from "./commerce.types"
import { AmountRow, SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/* ══ AddressCard ═══════════════════════════════════════════════════════════════════ */

export interface AddressCardProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	kind?: AddressKind
	name: string
	line1: string
	line2?: string
	city: string
	/** State, province, or region. */
	region?: string
	postalCode?: string
	country: string
	phone?: string
	/** Marks this as the account's default for its kind. */
	isDefault?: boolean
	onEdit?: () => void
	onRemove?: () => void
	onMakeDefault?: () => void
	strings?: Partial<AddressStrings>
}

export function AddressCard({
	kind = "shipping",
	name,
	line1,
	line2,
	city,
	region,
	postalCode,
	country,
	phone,
	isDefault = false,
	onEdit,
	onRemove,
	onMakeDefault,
	strings,
	className,
	...props
}: AddressCardProps) {
	const copy = { ...defaultAddressStrings, ...strings }

	return (
		<ContentBlock
			icon={<MapPinIcon aria-hidden="true" />}
			title={copy[kind]}
			titleSuffix={isDefault ? <Badge tone="info">{copy.defaultBadge}</Badge> : undefined}
			className={cx("address-card--component", styles.block, className)}
			{...props}
		>
			<AddressLines
				prominent
				address={{ name, line1, line2, city, region, postalCode, country, phone }}
			/>

			{(onEdit || onRemove || onMakeDefault) && (
				<div className={styles.blockActions}>
					{onEdit && (
						<Button tone="secondary" buttonStyle="outline" onClick={onEdit}>
							{copy.edit}
						</Button>
					)}
					{onMakeDefault && !isDefault && (
						<Button tone="secondary" buttonStyle="ghost" onClick={onMakeDefault}>
							{copy.makeDefault}
						</Button>
					)}
					{onRemove && (
						<Button tone="destructive" buttonStyle="ghost" onClick={onRemove}>
							{copy.remove}
						</Button>
					)}
				</div>
			)}
		</ContentBlock>
	)
}

/* ══ PaymentMethodCard ═════════════════════════════════════════════════════════════ */

/** How each brand is written. A label, not a palette — see the note in commerce.types.ts. */
const BRAND_LABEL: Record<PaymentBrand, string> = {
	visa: "Visa",
	mastercard: "Mastercard",
	amex: "American Express",
	paypal: "PayPal",
	applePay: "Apple Pay",
	googlePay: "Google Pay",
	unknown: "Card",
}

export interface PaymentMethodCardProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	brand: PaymentBrand
	/** The last four digits — the only part of a card number this component accepts. */
	last4: string
	/** `MM/YY`. */
	expiry?: string
	holderName?: string
	isDefault?: boolean
	/** Carries no value: this never holds a payment method to hand back. */
	onChange?: () => void
	strings?: Partial<PaymentMethodStrings>
}

export function PaymentMethodCard({
	brand,
	last4,
	expiry,
	holderName,
	isDefault = false,
	onChange,
	strings,
	className,
	...props
}: PaymentMethodCardProps) {
	const copy = { ...defaultPaymentMethodStrings, ...strings }
	const brandLabel = BRAND_LABEL[brand]

	return (
		<ContentBlock
			icon={<CreditCardIcon aria-hidden="true" />}
			title={copy.title}
			titleSuffix={isDefault ? <Badge tone="info">{copy.defaultBadge}</Badge> : undefined}
			className={cx("payment-method--component", styles.block, className)}
			{...props}
		>
			<div className={styles.paymentIdentity}>
				<IconBadge icon={CreditCardIcon} shape="rounded" />
				<div className={styles.paymentIdentityBody}>
					<Text weight="semibold">{copy.formatCard(brandLabel, last4)}</Text>
					{holderName != null && (
						<Text size="xs" type="secondary">
							{holderName}
						</Text>
					)}
				</div>
				{onChange && (
					<Button tone="secondary" buttonStyle="ghost" onClick={onChange}>
						{copy.change}
					</Button>
				)}
			</div>

			{expiry != null && (
				<SummaryPanel>
					<AmountRow label={copy.expires} amount={expiry} />
				</SummaryPanel>
			)}
		</ContentBlock>
	)
}

/* ══ SubscriptionSummary ═══════════════════════════════════════════════════════════ */

export interface SubscriptionPerk {
	label: string
	icon?: LucideIcon
}

export interface SubscriptionSummaryProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	planName: string
	/** Already formatted, including its currency. */
	price: string
	/** How often it recurs — "monthly", "per year". */
	cycle: string
	/** Already formatted. */
	nextBillingDate: string
	status?: ReactNode
	perks?: SubscriptionPerk[]
	onManage?: () => void
	onUpgrade?: () => void
	strings?: Partial<SubscriptionStrings>
}

export function SubscriptionSummary({
	planName,
	price,
	cycle,
	nextBillingDate,
	status,
	perks,
	onManage,
	onUpgrade,
	strings,
	className,
	...props
}: SubscriptionSummaryProps) {
	const copy = { ...defaultSubscriptionStrings, ...strings }

	return (
		<ContentBlock
			icon={<RepeatIcon aria-hidden="true" />}
			title={copy.title}
			titleSuffix={status != null ? <Badge tone="success">{status}</Badge> : undefined}
			className={cx("subscription-summary--component", styles.block, className)}
			{...props}
		>
			<div className={styles.orderFact}>
				<DisplayLabel>{copy.plan}</DisplayLabel>
				<Text weight="semibold">{planName}</Text>
			</div>

			<SummaryPanel>
				<AmountRow label={cycle} amount={price} total />
				<AmountRow label={copy.nextBilling} amount={nextBillingDate} />
			</SummaryPanel>

			{perks && perks.length > 0 && (
				<div className={styles.perks}>
					<DisplayLabel>{copy.included}</DisplayLabel>
					<ul className={styles.perkList}>
						{perks.map((perk) => (
							<li key={perk.label} className={styles.perk}>
								{perk.icon && <perk.icon className={styles.perkIcon} aria-hidden="true" />}
								<Text tag="span">
									{perk.label}
								</Text>
							</li>
						))}
					</ul>
				</div>
			)}

			{(onManage || onUpgrade) && (
				<div className={styles.blockActions}>
					{onUpgrade && <Button onClick={onUpgrade}>{copy.upgrade}</Button>}
					{onManage && (
						<Button tone="secondary" buttonStyle="outline" onClick={onManage}>
							{copy.manage}
						</Button>
					)}
				</div>
			)}
		</ContentBlock>
	)
}

/* ══ InventoryLevel ════════════════════════════════════════════════════════════════ */

export interface InventoryLevelProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	productName: string
	/** The chosen option, when the product has any. */
	variant?: string
	stock: number
	/** Below this, the level reads as low rather than healthy. */
	reorderLevel: number
	/** The gauge's upper bound. */
	maxStock: number
	/** Already formatted. */
	lastRestocked?: string
	strings?: Partial<InventoryStrings>
}

export function InventoryLevel({
	productName,
	variant,
	stock,
	reorderLevel,
	maxStock,
	lastRestocked,
	strings,
	className,
	...props
}: InventoryLevelProps) {
	const copy = { ...defaultInventoryStrings, ...strings }

	/* `out` is its own state, not a smaller `low`: nothing can be sold. */
	const state = stock <= 0 ? "out" : stock <= reorderLevel ? "low" : "ok"
	const tone = state === "out" ? "destructive" : state === "low" ? "warning" : "success"
	const label = state === "out" ? copy.outOfStock : state === "low" ? copy.lowStock : copy.inStock

	return (
		<ContentBlock
			icon={<PackageIcon aria-hidden="true" />}
			title={productName}
			description={variant}
			titleSuffix={<Badge tone={tone}>{label}</Badge>}
			className={cx("inventory-level--component", styles.block, className)}
			{...props}
		>
			<Text weight="semibold" numeric>{copy.formatLevel(stock, maxStock)}</Text>
			<Progress
				value={stock}
				max={maxStock}
				tone={tone}
				/* The bar shows the level by width alone; this is its accessible reading. */
				label={copy.formatLevel(stock, maxStock)}
			/>

			<SummaryPanel>
				<AmountRow label={copy.reorderAt} amount={String(reorderLevel)} />
				{lastRestocked != null && <AmountRow label={copy.lastRestocked} amount={lastRestocked} />}
			</SummaryPanel>
		</ContentBlock>
	)
}
