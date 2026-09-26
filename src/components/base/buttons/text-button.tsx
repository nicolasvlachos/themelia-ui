/**
 * TextButton — a button styled as a link, for actions on this page (announced as a
 * button, activated by Space). Anything that navigates should be a real anchor.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import { Button, type ButtonProps } from "./button"
import styles from "./button.module.css"

export type TextButtonProps = Omit<ButtonProps, "buttonStyle" | "iconOnly" | "fullWidth">

export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
	{ tone = "primary", className, ...props },
	ref,
) {
	return (
		<Button
			ref={ref}
			tone={tone}
			buttonStyle="ghost"
			/* Its own slot, so downstream code can tell inline prose from a ghost button in a control row. */
			data-slot="text-button"
			className={cx("text-button--component", styles.textButton, className)}
			{...props}
		/>
	)
})
