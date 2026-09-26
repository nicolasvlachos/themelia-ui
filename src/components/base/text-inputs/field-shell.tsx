/**
 * FieldShell — a control with inline affordances. The shell wears the field surface and the
 * control gives up its own (styles/fields.css, `data-field-shell`).
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./text-inputs.module.css"

/** Wiring forwarded through the shell to its actual control. */
export interface FieldShellControlProps {
	id?: string
	"aria-labelledby"?: React.AriaAttributes["aria-labelledby"]
	"aria-invalid"?: React.AriaAttributes["aria-invalid"]
	"aria-describedby"?: React.AriaAttributes["aria-describedby"]
	"aria-required"?: React.AriaAttributes["aria-required"]
}

export interface FieldShellProps extends Omit<React.ComponentProps<"div">, "children"> {
	/** Rendered before the control — an icon, a prefix, a currency symbol. */
	start?: React.ReactNode
	/** Rendered after the control — a unit, a clear button, a reveal toggle. */
	end?: React.ReactNode
	/** A direct control, or an explicit adapter for a wrapped/custom control. */
	children?:
		| React.ReactNode
		| ((controlProps: FieldShellControlProps) => React.ReactNode)
}

export function FieldShell({
	start,
	end,
	className,
	children,
	id,
	"aria-labelledby": ariaLabelledBy,
	"aria-invalid": ariaInvalid,
	"aria-describedby": ariaDescribedBy,
	"aria-required": ariaRequired,
	...props
}: FieldShellProps) {
	const rendersControl = typeof children === "function"
	const controlProps: FieldShellControlProps = {
		id,
		"aria-labelledby": ariaLabelledBy,
		"aria-invalid": ariaInvalid,
		"aria-describedby": ariaDescribedBy,
		"aria-required": ariaRequired,
	}
	/*
	 * `FormField`'s wiring (id and aria flags) goes to the control, not this wrapper, so the
	 * label names the control. A value already on the control wins.
	 */
	const wire = (element: React.ReactElement<Record<string, unknown>>) =>
		React.cloneElement(element, {
			id: element.props.id ?? controlProps.id,
			"aria-labelledby": element.props["aria-labelledby"] ?? (element.props["aria-label"] !== undefined ? undefined : controlProps["aria-labelledby"]),
			"aria-invalid": element.props["aria-invalid"] ?? controlProps["aria-invalid"],
			"aria-describedby":
				element.props["aria-describedby"] ?? controlProps["aria-describedby"],
			"aria-required": element.props["aria-required"] ?? controlProps["aria-required"],
		})

	const items = rendersControl ? [] : React.Children.toArray(children)
	const controlIndex = !rendersControl && React.isValidElement(children)
		? -1
		: items.findIndex((item) => React.isValidElement(item))
	const control = rendersControl
		? children(controlProps)
		: React.isValidElement<Record<string, unknown>>(children)
			? wire(children)
			: controlIndex === -1
				? children
				: items.map((item, position) =>
						position === controlIndex
							? wire(item as React.ReactElement<Record<string, unknown>>)
							: item,
					)

	return (
		<div
			data-slot="field-shell"
			data-field-shell=""
			className={cx("field-shell--component", className)}
			{...props}
		>
			{!!start && <span className={styles.addon}>{start}</span>}
			{control}
			{!!end && <span className={styles.addon}>{end}</span>}
		</div>
	)
}
