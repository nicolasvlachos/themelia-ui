/**
 * AlertMetadata — key/value pairs under an alert's message (request id, timestamp, failing
 * field), as a `<dl>` so each pair is read together.
 */
import type { ComponentProps, ReactNode } from "react"

import { textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./feedback.module.css"

export interface AlertMetadataItem {
	label: ReactNode
	value: ReactNode
}

export interface AlertMetadataProps extends Omit<ComponentProps<"dl">, "children"> {
	/** Key/value detail under the message — a request id, a timestamp, a failing field. */
	items: AlertMetadataItem[]
}

/** Key/value pairs under an alert's message, as a `<dl>` so each pair is read together. */
export function AlertMetadata({ items, className, ...props }: AlertMetadataProps) {
	if (items.length === 0) return null

	return (
		<dl
			className={cx("alert-metadata--component", styles.alertMeta, textClassName({ size: "xs" }), className)}
			{...props}
		>
			{items.map((item, index) => (
				<div key={index} className={styles.alertMetaItem}>
					<dt className={cx(styles.alertMetaLabel, textClassName({ size: "inherit", type: "secondary" }))}>
						{item.label}
					</dt>
					<dd className={cx(styles.alertMetaValue, textClassName({ size: "inherit", numeric: true }))}>
						{item.value}
					</dd>
				</div>
			))}
		</dl>
	)
}
