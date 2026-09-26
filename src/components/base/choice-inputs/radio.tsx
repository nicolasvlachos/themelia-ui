/** Radio and RadioGroup. The group supplies the shared `name` that makes the radios exclusive. */
import { CircleIcon } from "lucide-react"
import * as React from "react"

import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import styles from "./choice.module.css"

const RadioGroupContext = React.createContext<{ name?: string }>({})

export interface RadioProps extends Omit<React.ComponentProps<"input">, "type" | "size"> {
	label?: React.ReactNode
}

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
	/** Shared across every radio inside, which is what makes them exclusive. */
	name: string
	orientation?: "vertical" | "horizontal"
}

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
