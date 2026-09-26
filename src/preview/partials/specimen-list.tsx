import { Fragment } from "react"
import type { ReactNode } from "react"

import { cx } from "@/lib/cx"

import styles from "../preview.module.css"

export interface Specimen {
	/** The call that produced the value beside it. Written as it would be typed. */
	code: string
	value: ReactNode
}

/** The call on the left, what it renders on the right: the shape every primitive page uses. */
export function SpecimenList({
	items,
	/** Narrows the value column, so right-aligned numbers have something to align within. */
	numeric = false,
}: {
	items: Specimen[]
	numeric?: boolean
}) {
	return (
		<div className={cx(styles.specimens, numeric && styles.specimensNumeric)}>
			{items.map((item) => (
				<Fragment key={item.code}>
					<code className={styles.specimenCode}>{item.code}</code>
					<div className={styles.specimenValue}>{item.value}</div>
				</Fragment>
			))}
		</div>
	)
}
