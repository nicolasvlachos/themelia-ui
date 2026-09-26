/** Radio and RadioGroup. The group supplies the shared `name` that makes the radios exclusive. */
import { CircleIcon } from "lucide-react"
import * as React from "react"

import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import styles from "./choice.module.css"

const RadioGroupContext = React.createContext<{ name?: string }>({})

export interface RadioProps
	extends Omit<React.ComponentProps<"input">, "type" | "size">,
		Pick<React.ComponentProps<"input">, "value" | "checked" | "defaultChecked" | "onChange"> {
	/** Rendered beside the circle and wired to it, so the text is part of the target. */
	label?: React.ReactNode
}

/**
 * One option: a native radio under the kit's styling. `checked` and `defaultChecked` are
 * its controlled and uncontrolled selection, and the group supplies the shared `name`.
 * `onChange` receives the native input event: read `event.target.value` for the selected
 * value.
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
	{ label, className, name, ...props },
	ref,
) {
	const group = React.useContext(RadioGroupContext)

	return (
		<label className={cx("radio--component", styles.field, className)}>
			<input
				ref={ref}
				type="radio"
				data-slot="radio"
				name={name ?? group.name}
				className={styles.input}
				{...props}
			/>
			<span className={cx(styles.control, styles.radio)}>
				<CircleIcon aria-hidden className={styles.dot} />
			</span>
			{!!label && <span className={styles.label}>{label}</span>}
		</label>
	)
})

export interface RadioGroupProps extends Omit<React.ComponentProps<"div">, "onChange"> {
	/**
	 * Groups the options: shared across every radio inside, which is what makes them
	 * exclusive. A native radio group needs it to behave as one.
	 */
	name: string
	/** The direction the options run in. */
	orientation?: "vertical" | "horizontal"
}

/** Radios that exclude each other. The group supplies the shared `name` that does it. */
export function RadioGroup({
	name,
	orientation = "vertical",
	className,
	children,
	...props
}: RadioGroupProps) {
	const value = React.useMemo(() => ({ name }), [name])
	return (
		<RadioGroupContext.Provider value={value}>
			<Stack
				role="radiogroup"
				data-slot="radio-group"
				direction={orientation === "horizontal" ? "horizontal" : "vertical"}
				gap={orientation === "horizontal" ? "xl" : "sm"}
				align="start"
				wrap={orientation === "horizontal"}
				className={cx("radio-group--component", className)}
				{...props}
			>
				{children}
			</Stack>
		</RadioGroupContext.Provider>
	)
}
