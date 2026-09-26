import * as React from "react"

import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "../cards.module.css"

/** Content region. Owns the inset, and drops its top padding when a header precedes it. */
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="card-content" className={cx("card--content", styles.content, className)} {...props} />
}

export function CardFooter({
	divider,
	text,
	className,
	children,
	...props
}: React.ComponentProps<"div"> & { divider?: boolean; text?: React.ReactNode }) {
	return (
		<Stack
			direction="horizontal"
			align="center"
			wrap
			gap="md"
			data-slot="card-footer"
			className={cx("card--footer", styles.footer, divider && styles.footerDivider, className)}
			{...props}
		>
			{!!text && (
				<Text type="secondary" size="xs">
					{text}
				</Text>
			)}
			{children}
		</Stack>
	)
}
