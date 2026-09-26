/**
 * FieldGroup — related fields under one legend: a real `<fieldset>`/`<legend>`, so the
 * legend is announced when focus enters the group.
 */
import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./forms.module.css"

export interface FieldGroupProps extends React.ComponentProps<"fieldset"> {
	legend?: React.ReactNode
	description?: React.ReactNode
}

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
