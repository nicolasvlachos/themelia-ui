/**
 * FieldGroup — related fields under one legend: a real `<fieldset>`/`<legend>`, so the
 * legend is announced when focus enters the group.
 */
import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./forms.module.css"

export interface FieldGroupProps extends React.ComponentProps<"fieldset"> {
	/** The group's one label, announced when focus enters the group. */
	legend?: React.ReactNode
	/** The group's one supporting line. */
	description?: React.ReactNode
}

/**
 * Several fields sharing one label and one supporting line — a date range, a name split in
 * two. A real `<fieldset>` and `<legend>`, so the legend is announced when focus enters the
 * group.
 */
export function FieldGroup({ legend, description, className, children, ...props }: FieldGroupProps) {
	const descriptionId = React.useId()
	return (
		<fieldset
			data-slot="field-group"
			// The legend names the fieldset natively; the description needs `aria-describedby`.
			aria-describedby={description ? descriptionId : undefined}
			className={cx("field-group--component", styles.group, className)}
			{...props}
		>
			{!!legend && (
				<legend className={styles.groupLegend}>
					<Text tag="span" weight="medium">
						{legend}
					</Text>
				</legend>
			)}
			{!!description && (
				<Text id={descriptionId} type="secondary" size="xs">
					{description}
				</Text>
			)}
			{children}
		</fieldset>
	)
}
