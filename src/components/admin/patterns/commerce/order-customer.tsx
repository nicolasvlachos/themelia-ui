/**
 * OrderCustomer: who bought it and where it goes. A read-only panel, unlike the editable
 * `AddressCard`. `billingSameAsShipping` renders one line instead of a repeated address.
 */
import { MailIcon, PencilIcon, PhoneIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Button } from "@/components/base/buttons"
import { ContentBlock, Separator } from "@/components/base/display"
import { DisplayLabel, Text } from "@/components/base/typography"
import { Email, formatInitials, Phone } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { AddressLines } from "./address-lines"
import { defaultOrderCustomerStrings, type OrderCustomerStrings } from "./commerce.strings"
import type { OrderAddress } from "./commerce.types"
import styles from "./commerce.module.css"

export interface OrderCustomerProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	name: string
	email?: string
	phone?: string
	/** How many orders this customer has placed, this one included. */
	orderCount?: number
	shippingAddress?: OrderAddress
	billingAddress?: OrderAddress
	/** Renders one line in place of a repeated address. */
	billingSameAsShipping?: boolean
	onOpenCustomer?: () => void
	onEditShipping?: () => void
	onEditBilling?: () => void
	strings?: Partial<OrderCustomerStrings>
}

/* A contact line: the glyph names the channel, so no label. */
function ContactLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
	return (
		<span className={styles.customerContactLine}>
			<span className={styles.customerContactIcon} aria-hidden="true">
				{icon}
			</span>
			{children}
		</span>
	)
}

export function OrderCustomer({
	name,
	email,
	phone,
	orderCount,
	shippingAddress,
	billingAddress,
	billingSameAsShipping = false,
	onOpenCustomer,
	onEditShipping,
	onEditBilling,
	strings,
	className,
	...props
}: OrderCustomerProps) {
	const copy = { ...defaultOrderCustomerStrings, ...strings }

	const section = (
		label: string,
		editLabel: string,
		address: OrderAddress | undefined,
		onEdit: (() => void) | undefined,
		sameAsShipping = false,
	) => (
		<div className={styles.customerSection}>
			<div className={styles.customerSectionHead}>
				<DisplayLabel>{label}</DisplayLabel>
				{/* Icon only; the accessible name says what is edited. */}
				{onEdit && (
					<Button
						tone="secondary"
						buttonStyle="ghost"
						iconOnly
						aria-label={editLabel}
						onClick={onEdit}
					>
						<PencilIcon aria-hidden="true" />
					</Button>
				)}
			</div>
			{sameAsShipping ? (
				<Text size="xs" type="secondary">
					{copy.sameAsShipping}
				</Text>
			) : address ? (
				<AddressLines address={address} className={styles.addressCompact} />
			) : (
				<Text size="xs" type="secondary">
					{copy.noAddress}
				</Text>
			)}
		</div>
	)

	const identity = (
		<>
			<Text weight="semibold">{name}</Text>
			{orderCount != null && (
				<Text size="xs" type="secondary">
					{copy.formatOrderCount(orderCount)}
				</Text>
			)}
		</>
	)

	return (
		<ContentBlock
			title={copy.title}
			className={cx("order-customer--component", styles.block, className)}
			{...props}
		>
			{/* An identity (avatar and name), not a label and a value. */}
			<div className={cx("order-customer--identity", styles.customerIdentity)}>
				<Avatar size="lg">
					<AvatarFallback>{formatInitials(name)}</AvatarFallback>
				</Avatar>
				{onOpenCustomer ? (
					/* A button: the caller decides whether opening a customer navigates or opens a drawer. */
					<Button
						tone="neutral"
						buttonStyle="ghost"
						onClick={onOpenCustomer}
						className={styles.customerName}
					>
						<span className={styles.customerIdentityBody}>{identity}</span>
					</Button>
				) : (
					<span className={styles.customerIdentityBody}>{identity}</span>
				)}
			</div>

			{(email != null || phone != null) && (
				<>
					<Separator />
					<div className={styles.customerContact}>
						{email != null && (
							<ContactLine icon={<MailIcon />}>
								<Email value={email} />
							</ContactLine>
						)}
						{phone != null && (
							<ContactLine icon={<PhoneIcon />}>
								<Phone value={phone} />
							</ContactLine>
						)}
					</div>
				</>
			)}

			<Separator />
			{/* Side by side once there is room, so the two are easy to compare. */}
			<div className={cx("order-customer--addresses", styles.customerAddresses)}>
				{section(copy.shippingAddress, copy.editShipping, shippingAddress, onEditShipping)}
				{section(
					copy.billingAddress,
					copy.editBilling,
					billingAddress,
					onEditBilling,
					billingSameAsShipping,
				)}
			</div>
		</ContentBlock>
	)
}
