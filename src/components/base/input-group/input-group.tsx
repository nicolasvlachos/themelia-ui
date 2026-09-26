import * as React from "react"

import { Button } from "@/components/base/buttons"
import { Input } from "@/components/base/text-inputs"
import { Textarea, type TextareaProps } from "@/components/base/text-inputs"
import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import { Text } from "@/components/base/typography"

import styles from "./input-group.module.css"

/*
 * FormField clones its wiring onto the group, which is not the control; the group keeps it
 * and hands it to the input or textarea inside.
 */
type FieldWiring = {
	id?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: React.AriaAttributes["aria-invalid"]
	"aria-required"?: React.AriaAttributes["aria-required"]
}

const InputGroupFieldContext = React.createContext<FieldWiring>({})

function useFieldWiring<P extends Record<string, unknown>>(props: P): P {
	const wiring = React.useContext(InputGroupFieldContext)
	return {
		...props,
		id: props.id ?? wiring.id,
		"aria-labelledby": props["aria-labelledby"] ?? (props["aria-label"] !== undefined ? undefined : wiring["aria-labelledby"]),
		"aria-describedby": props["aria-describedby"] ?? wiring["aria-describedby"],
		"aria-invalid": props["aria-invalid"] ?? wiring["aria-invalid"],
		"aria-required": props["aria-required"] ?? wiring["aria-required"],
	}
}

/**
 * The shell, with `role="group"`. It owns the border and the focus ring for whatever is
 * inside, so the control strips its own.
 */
function InputGroup({
	className,
	id,
	"aria-labelledby": labelledBy,
	"aria-describedby": describedBy,
	"aria-invalid": invalid,
	"aria-required": required,
	...props
}: React.ComponentProps<"div">) {
	const wiring = React.useMemo<FieldWiring>(
		() => ({ id, "aria-labelledby": labelledBy, "aria-describedby": describedBy, "aria-invalid": invalid, "aria-required": required }),
		[id, labelledBy, describedBy, invalid, required],
	)
	return (
		<InputGroupFieldContext.Provider value={wiring}>
			<div data-slot="input-group" role="group" className={cx("input-group--component", styles.root, className)} {...props} />
		</InputGroupFieldContext.Provider>
	)
}

const inputGroupAddonVariants = cvm(styles.addon, {
	variants: {
		align: {
			"inline-start": styles.alignInlineStart,
			"inline-end": styles.alignInlineEnd,
			"block-start": styles.alignBlockStart,
			"block-end": styles.alignBlockEnd,
		},
	},
	defaultVariants: {
		align: "inline-start",
	},
})

export interface InputGroupAddonProps extends React.ComponentProps<"div"> {
	/**
	 * Where the addon attaches. The inline edges sit on the control's line; the block edges
	 * take a row of their own, for a toolbar above a textarea or a hint below one.
	 */
	align?: "inline-start" | "inline-end" | "block-start" | "block-end"
}

/**
 * Something attached to the field — a unit, a prefix, a submit. Clicking it focuses the
 * control, as a label does, unless the click lands on a button.
 */
function InputGroupAddon({
	className,
	align = "inline-start",
	...props
}: InputGroupAddonProps) {
	return (
		<div
			data-slot="input-group-addon"
			data-align={align}
			className={cx("input-group-addon--component", inputGroupAddonVariants({ align, className }))}
			onClick={(e) => {
				// Clicking the addon focuses the field, like a label — unless it hit a button.
				if ((e.target as HTMLElement).closest("button")) {
					return
				}
				e.currentTarget.parentElement?.querySelector<HTMLElement>("[data-field-control]")?.focus()
			}}
			{...props}
		/>
	)
}

const inputGroupButtonVariants = cvm(styles.button, {
	variants: {
		size: {
			xs: styles.buttonXs,
			sm: styles.buttonSm,
			"icon-xs": styles.buttonIconXs,
			"icon-sm": styles.buttonIconSm,
		},
	},
	defaultVariants: {
		size: "xs",
	},
})

export interface InputGroupButtonProps extends Omit<React.ComponentProps<typeof Button>, "size" | "type"> {
	/**
	 * The sizes that fit inside a field: two text sizes and their icon-only twins. A
	 * full-height Button would set the field's height rather than fit in it, which is why
	 * this is the one place the kit keeps a size prop on a control.
	 */
	size?: "xs" | "sm" | "icon-xs" | "icon-sm"
	/** The native button type: `button` unless set, so pressing it never submits the form around the field. */
	type?: "button" | "submit" | "reset"
}

/** A quiet Button sized to sit inside the field rather than beside it. */
function InputGroupButton({
	className,
	type = "button",
	tone = "neutral",
	buttonStyle = "ghost",
	size = "xs",
	...props
}: InputGroupButtonProps) {
	// Quiet by default, with nested-radius sizes rather than the standard action scale.
	return (
		<Button
			type={type}
			data-size={size}
			tone={tone}
			buttonStyle={buttonStyle}
			className={cx("input-group-button--component", inputGroupButtonVariants({ size, className }))}
			{...props}
		/>
	)
}

/**
 * Secondary text at the group's own size — a unit, a domain suffix, a counter. It inherits
 * the size, so it cannot drift from the input beside it.
 */
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
	return <Text tag="span" size="inherit" type="secondary" className={cx("input-group-text--component", styles.text, className)} {...props} />
}

/**
 * The kit's Input with its chrome removed, because the group is drawing it. Every other
 * prop passes through.
 */
function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
	return <Input className={cx("input-group-input--component", styles.control, className)} {...useFieldWiring(props)} />
}

/**
 * The kit's Textarea with its chrome removed, because the group is drawing it. Every other
 * prop passes through.
 */
function InputGroupTextarea({ className, ...props }: TextareaProps) {
	return (
		<Textarea
			className={cx("input-group-textarea--component", styles.control, styles.controlTextarea, className)}
			{...useFieldWiring(props)}
		/>
	)
}

export {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupInput,
	InputGroupTextarea,
}

/* Named prop types, so wrappers needn't restate which element each part renders. */
export type InputGroupProps = React.ComponentProps<"div">
export type InputGroupTextProps = React.ComponentProps<"span">
export type InputGroupInputProps = React.ComponentProps<"input">
export type InputGroupTextareaProps = React.ComponentProps<"textarea">
