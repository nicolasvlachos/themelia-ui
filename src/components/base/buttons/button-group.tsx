/** ButtonGroup — adjacent buttons read as one control: one hairline seam, squared inner corners. */
import * as React from "react"

import { cx } from "@/lib/cx"
import { Text } from "@/components/base/typography"

import styles from "./button-group.module.css"

export interface ButtonGroupProps extends React.ComponentProps<"div"> {
	/** The direction the buttons run in. */
	orientation?: "horizontal" | "vertical"
}

/** Adjacent buttons that read as one control: one hairline seam, squared inner corners. */
export function ButtonGroup({
	orientation = "horizontal",
	className,
	...props
}: ButtonGroupProps) {
	return (
		<div
			role="group"
			data-slot="button-group"
			data-orientation={orientation}
			className={cx(
				"button-group--component",
				styles.root,
				orientation === "vertical" && styles.vertical,
				className,
			)}
			{...props}
		/>
	)
}

export interface ButtonGroupTextProps extends React.ComponentProps<"span"> {}

/**
 * A label that sits in the run without becoming pressable — a unit, a prefix, a count. A
 * span, so it adds no tab stop.
 */
export function ButtonGroupText({ className, ...props }: ButtonGroupTextProps) {
	return (
		<Text
			tag="span"
			size="inherit"
			type="secondary"
			data-slot="button-group-text"
			className={cx("button-group-text--component", styles.groupText, className)}
			{...props}
		/>
	)
}

export interface ButtonGroupSeparatorProps extends React.ComponentProps<"div"> {
	/** The orientation of the group it sits in; the seam runs across it. */
	orientation?: "horizontal" | "vertical"
}

/**
 * The seam between welded buttons, where the collapsed border alone is not enough. A plain
 * `Separator` here would draw a full-height rule against the group's own border.
 */
export function ButtonGroupSeparator({
	orientation = "horizontal",
	className,
	...props
}: ButtonGroupSeparatorProps) {
	return (
		<div
			role="separator"
			aria-orientation={orientation === "vertical" ? "horizontal" : "vertical"}
			data-slot="button-group-separator"
			className={cx("button-group-separator--component",
				styles.groupSeparator,
				orientation === "vertical" && styles.groupSeparatorVertical,
				className,
			)}
			{...props}
		/>
	)
}
