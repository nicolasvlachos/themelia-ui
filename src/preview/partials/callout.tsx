import type { ReactNode } from "react"

import { DisplayLabel, Text } from "@/components/base/typography"

import styles from "../preview.module.css"

/** An aside worth interrupting the reading for (a constraint, a gotcha, a why), with a label. */
export function Callout({
	label = "Note",
	children,
}: {
	label?: string
	children: ReactNode
}) {
	return (
		<div className={styles.callout}>
			<span className={styles.calloutLabel}>
				<DisplayLabel>{label}</DisplayLabel>
			</span>
			<Text type="secondary">
				{children}
			</Text>
		</div>
	)
}
