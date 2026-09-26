/**
 * TextButton — a button styled as a link, for actions on this page (announced as a
 * button, activated by Space). Anything that navigates should be a real anchor.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import { Button, type ButtonProps } from "./button"
import styles from "./button.module.css"
import type { ButtonTone } from "./button.types"

export type TextButtonProps = Omit<ButtonProps, "tone" | "buttonStyle" | "iconOnly" | "fullWidth"> & {
	/**
	 * Semantic colour intent. A text button always sets it, so the provider's button defaults
	 * do not reach it.
	 */
	tone?: ButtonTone
}

/**
 * A button that reads as a link, for actions on this page: announced as a button and
 * activated by Space. Anything that navigates should be a real anchor. It carries its own
 * `data-slot`, so nothing downstream mistakes it for a ghost button that should line up
 * with controls — it is inline prose.
 */
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
