/**
 * AlertMetadata — key/value pairs under an alert's message (request id, timestamp, failing
 * field), as a `<dl>` so each pair is read together.
 */
import type { ComponentProps, ReactNode } from "react"

import { cx } from "@/lib/cx"

import styles from "./feedback.module.css"

export interface AlertMetadataItem {
	label: ReactNode
	value: ReactNode
}

export interface AlertMetadataProps extends Omit<ComponentProps<"dl">, "children"> {
	items: AlertMetadataItem[]
}

export function AlertMetadata({ items, className, ...props }: AlertMetadataProps) {
	if (items.length === 0) return null

	return (
		<dl className={cx("alert-metadata--component", styles.alertMeta, className)} {...props}>
			{items.map((item, index) => (
				<div key={index} className={styles.alertMetaItem}>
					<dt className={styles.alertMetaLabel}>{item.label}</dt>
					<dd className={styles.alertMetaValue}>{item.value}</dd>
				</div>
			))}
		</dl>
	)
}
