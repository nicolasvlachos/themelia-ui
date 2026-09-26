/**
 * FormField — label, control and one supporting line: `error || helperText || hint`, one
 * replacing the next so the field never shifts as validation changes (so copy needed while
 * fixing an error belongs in the error). The field owns the ids and wires the label,
 * `aria-describedby` and `aria-invalid` onto the control.
 */
import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./forms.module.css"

export interface FieldChromeProps {
	/** Caption above the control, associated through `htmlFor`. */
	label?: React.ReactNode
	/** Marks the field required and renders the indicator beside the label. */
	required?: boolean
	/** Lowest priority: shown only when neither `error` nor `helperText` is set. */
	hint?: React.ReactNode
	/** Middle priority: replaces `hint`, and is itself replaced by `error`. */
	helperText?: React.ReactNode
	/** Highest priority. Announced politely and switches the control to its invalid state. */
	error?: React.ReactNode
}

/** Wiring a custom or wrapped control receives from `FormField`. */
export interface FormFieldControlProps {
	id?: string
	"aria-labelledby"?: React.AriaAttributes["aria-labelledby"]
	"aria-invalid"?: React.AriaAttributes["aria-invalid"]
	"aria-describedby"?: React.AriaAttributes["aria-describedby"]
	"aria-required"?: React.AriaAttributes["aria-required"]
}

export type FormFieldControl =
	| React.ReactNode
	| ((controlProps: FormFieldControlProps) => React.ReactNode)

export interface FormFieldProps
	extends FieldChromeProps,
		Omit<React.ComponentProps<"div">, "children"> {
	/** A direct control, or an explicit adapter for a wrapped/custom control. */
	children: FormFieldControl
	/** Label beside the control instead of above it — for settings rows. */
	orientation?: "vertical" | "horizontal"
	/**
	 * The id the caption addresses, or `false` when there is no single labelable element.
	 * A string is for a control that can't take the generated id. `false` is for a cluster
	 * (repeater, checkbox group, segments): the field becomes a named `group` instead. Opt-in,
	 * because a group sharing its control's name makes `getByLabelText` ambiguous.
	 */
	htmlFor?: string | false
}

export function FormField({
	label,
	required = false,
	hint,
	helperText,
	error,
	orientation = "vertical",
	htmlFor,
	className,
	children,
	...props
}: FormFieldProps) {
	const generatedId = React.useId()
	const rendersControl = typeof children === "function"

	/*
	 * The first element child is the control, so a control with siblings (a tag row, a
	 * preview) still gets the id.
	 */
	const childList = rendersControl ? [] : React.Children.toArray(children)
	const controlIndex = !rendersControl && React.isValidElement(children)
		? -1
		: childList.findIndex((child) => React.isValidElement(child))
	const controlElement = (
		!rendersControl && React.isValidElement(children)
			? children
			: controlIndex === -1
				? null
				: childList[controlIndex]
	) as React.ReactElement<Record<string, unknown>> | null

	/* The label follows the control's own id when it has one. */
	const asGroup = htmlFor === false
	const controlId = asGroup
		? undefined
		: (htmlFor ?? (controlElement?.props.id as string | undefined) ?? `${generatedId}-control`)
	const supportId = `${generatedId}-support`
	const labelId = `${generatedId}-label`

	/* An empty error ("", false, null) is no error, for both the invalid state and the support line. */
	const hasError = error !== undefined && error !== null && error !== false && error !== ""
	const support = (hasError ? error : undefined) ?? helperText ?? hint
	const controlProps: FormFieldControlProps = {
		id: controlId,
		"aria-labelledby": label ? labelId : undefined,
		"aria-invalid": hasError || undefined,
		"aria-describedby": support ? supportId : undefined,
		"aria-required": required || undefined,
	}

	/* Cloned to add the wiring; props the caller set explicitly win. */
	const wire = (element: React.ReactElement<Record<string, unknown>>) =>
		React.cloneElement(element, {
			id: controlProps.id ?? element.props.id,
			"aria-labelledby": element.props["aria-labelledby"] ?? (element.props["aria-label"] !== undefined ? undefined : controlProps["aria-labelledby"]),
			"aria-invalid": element.props["aria-invalid"] ?? controlProps["aria-invalid"],
			"aria-describedby":
				element.props["aria-describedby"] ?? controlProps["aria-describedby"],
			"aria-required": element.props["aria-required"] ?? controlProps["aria-required"],
		})

	const control = rendersControl
		? children(controlProps)
		: React.isValidElement<Record<string, unknown>>(children)
			? wire(children)
			: controlIndex === -1
				? children
				: childList.map((child, position) =>
						position === controlIndex
							? wire(child as React.ReactElement<Record<string, unknown>>)
							: child,
					)

	/* A group carries the support line itself: a cluster has no single element to forward it to. */
	const groupDescribedBy = asGroup && support ? supportId : undefined

	const supportLine = !!support && (
		<Text
			id={supportId}
			size="xs"
			type={hasError ? "error" : "secondary"}
			// `status` (polite): a per-keystroke error must not interrupt typing.
			role={hasError ? "status" : undefined}
		>
			{support}
		</Text>
	)

	const labelNode = !!label && (
		<label
			id={labelId}
			htmlFor={controlId}
			className={cx("form-field--label", styles.label)}
		>
			{label}
			{!!required && (
				<span className={styles.required} aria-hidden>
					*
				</span>
			)}
		</label>
	)

	if (orientation === "horizontal") {
		return (
			<div
				data-slot="form-field"
				data-orientation="horizontal"
				role={asGroup ? "group" : undefined}
				aria-labelledby={asGroup ? labelId : undefined}
				aria-describedby={groupDescribedBy}
				className={cx("form-field--component", styles.field, styles.fieldHorizontal, className)}
				{...props}
			>
				{labelNode}
				<div className={styles.fieldHorizontalBody}>
					{control}
					{supportLine}
				</div>
			</div>
		)
	}

	return (
		<div
			data-slot="form-field"
			data-orientation="vertical"
			role={asGroup ? "group" : undefined}
			aria-labelledby={asGroup ? labelId : undefined}
			aria-describedby={groupDescribedBy}
			className={cx("form-field--component", styles.field, className)}
			{...props}
		>
			{labelNode}
			{control}
			{supportLine}
		</div>
	)
}
