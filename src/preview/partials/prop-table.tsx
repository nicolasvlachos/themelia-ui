import { Fragment } from "react"

import { Text } from "@/components/base/typography"

import { withCodeSpans } from "./code-spans"
import styles from "../preview.module.css"

export type PropRow = {
	name: string
	/**
	 * Exact source target(s) for abbreviated labels or another owner. Examples:
	 * "Button.tone", "useThing().result", "useThing[1].option", "ItemType.label",
	 * "@/lib/forms#FormControl", or "css:--control-h". Bare symbols validate exports.
	 * This metadata is consumed by verify documented-defaults, never rendered.
	 */
	api?: string | string[]
	type: string
	default?: string
	description: string
	/** Marks a prop a reader must supply. */
	required?: boolean
}

/** `<wbr>` break opportunities in an identifier: after a dot and before each camelCase hump. */
function breakable(name: string) {
	return withBreaks(name.split(/(?<=\.)|(?=[A-Z])/))
}

/** The same for a type: also at a generic's opening and its commas. */
function breakableType(type: string) {
	return withBreaks(type.split(/(?<=[<,])|(?=[A-Z])/))
}

function withBreaks(parts: string[]) {
	return parts.map((part, index) => (
		<Fragment key={index}>
			{index > 0 && <wbr />}
			{part}
		</Fragment>
	))
}

/** The API surface of one component. */
export function PropTable({ rows }: {
	rows: PropRow[]
	/** TypeScript owner for unqualified rows. Functions use their first parameter; types use their members. */
	owner?: string
}) {
	return (
		<div className={styles.tableWrap} tabIndex={0} role="group" aria-label="Component API">
			<table className={styles.table}>
				<thead>
					<tr>
						<th>Prop</th>
						<th>Type</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{/* Keyed by position: one prop name may appear twice in a family's table. */}
					{rows.map((row, rowIndex) => (
						<tr key={`${row.name}-${rowIndex}`}>
							<td>
								<span className={styles.tableCode}>{breakable(row.name)}</span>
								{!!row.required && (
									<Text tag="span" type="error" size="xs">
										{" *"}
									</Text>
								)}
							</td>
							<td>
								<span className={`${styles.tableCode} ${styles.tableType}`}>{breakableType(row.type)}</span>
							</td>
							<td>
								<Text tag="span" type="secondary" size="xs">
									<span className={styles.tableCode}>{row.default ?? "—"}</span>
								</Text>
							</td>
							<td>
								<Text tag="span" size="sm">
									{withCodeSpans(row.description)}
								</Text>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
