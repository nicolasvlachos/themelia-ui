/**
 * AddressLines: the postal block shared by `AddressCard` and `OrderCustomer`. Size is
 * inherited from the container (`size="inherit"`), the `Phone` primitive included.
 */
import type { ComponentProps } from "react"

import { Text } from "@/components/base/typography"
import { Phone } from "@/components/primitives"
import { cx } from "@/lib/cx"

import type { OrderAddress } from "./commerce.types"
import styles from "./commerce.module.css"

export interface AddressLinesProps extends Omit<ComponentProps<"address">, "children"> {
	address: OrderAddress
	/** Sets the recipient in the card's own weight, for a surface that leads on the name. */
	prominent?: boolean
}

export function AddressLines({ address, prominent = false, className, ...props }: AddressLinesProps) {
	/* A real `<address>`; the city line joins only the parts that exist. */
	const cityLine = [address.city, address.region, address.postalCode].filter(Boolean).join(", ")

	return (
		<address className={cx("address-lines--component", styles.address, className)} {...props}>
			{address.name != null && (
				<Text size="inherit" weight={prominent ? "semibold" : undefined}>
					{address.name}
				</Text>
			)}
			<Text size="inherit" type="secondary">
				{address.line1}
			</Text>
			{address.line2 != null && (
				<Text size="inherit" type="secondary">
					{address.line2}
				</Text>
			)}
			<Text size="inherit" type="secondary">
				{cityLine}
			</Text>
			<Text size="inherit" type="secondary">
				{address.country}
			</Text>
			{address.phone != null && <Phone value={address.phone} />}
		</address>
	)
}
