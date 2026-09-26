/** LoyaltyPoints: the balance, the tier, and recent movements. */
import type { ComponentProps, ReactNode } from "react"

import type { BadgeTone } from "@/components/base/badge"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/base/item"
import { DisplayLabel, Text } from "@/components/base/typography"
import { Number as NumberValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultLoyaltyStrings, type LoyaltyStrings } from "./commerce.strings"
import { stripLeadingMinus } from "./format-amount"
import styles from "./commerce.module.css"

export interface LoyaltyMovement {
	id: string
	/** What earned or spent the points. */
	label: string
	/** Already formatted. */
	date: string
	/** The magnitude. The sign is drawn from `earned`, not parsed out of this. */
	points: string
	earned: boolean
}

export interface LoyaltyPointsProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	/** A number gets locale grouping; a string is taken as already formatted. */
	balance: number | string
	/** The tier's name. A caller's word, so there is no English default to leak. */
	tier?: ReactNode
	tierTone?: BadgeTone
	movements?: LoyaltyMovement[]
	onRedeem?: () => void
	strings?: Partial<LoyaltyStrings>
}

export function LoyaltyPoints({
	balance,
	tier,
	tierTone = "warning",
	movements,
	onRedeem,
	strings,
	className,
	...props
}: LoyaltyPointsProps) {
	const copy = { ...defaultLoyaltyStrings, ...strings }

	return (
		<ContentBlock
			title={copy.title}
			titleSuffix={tier != null ? <Badge tone={tierTone}>{tier}</Badge> : undefined}
			className={cx("loyalty-points--component", styles.block, className)}
			{...props}
		>
			{/* Two labelled peer sections; the balance figure out-ranks its label. */}
			<div className={styles.loyaltyBalance}>
				<DisplayLabel>{copy.balanceLabel}</DisplayLabel>
				<span className={styles.loyaltyFigure}>
					<Text tag="span" size="xl" weight="bold" numeric lineHeight="none">
						{typeof balance === "number" ? <NumberValue value={balance} size="inherit" weight="bold" /> : balance}
					</Text>
					<Text tag="span" size="xs" type="secondary">
						{copy.pointsAvailable}
					</Text>
				</span>
			</div>

			{/* A ruled list under its own label. */}
			{movements && movements.length > 0 && (
				<div className={styles.loyaltyActivity}>
					<DisplayLabel>{copy.activityLabel}</DisplayLabel>
					<ItemGroup ruled>
						{movements.map((movement) => (
							<Item key={movement.id}>
								<ItemContent>
									<ItemTitle>{movement.label}</ItemTitle>
									<ItemDescription>{movement.date}</ItemDescription>
								</ItemContent>
								<ItemActions>
									{/* The sign comes from `earned`, never from the string. */}
									<Text
										tag="span"
										type={movement.earned ? "success" : "secondary"}
										weight="semibold"
										numeric
									>
										{movement.earned ? "+" : "−"}
										{stripLeadingMinus(movement.points).replace(/^\+\s*/, "")}
									</Text>
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				</div>
			)}

			{onRedeem && (
				<div className={styles.blockActions}>
					<Button onClick={onRedeem}>{copy.redeem}</Button>
				</div>
			)}
		</ContentBlock>
	)
}
