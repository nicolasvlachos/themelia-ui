/**
 * ScrollArea — a scrolling region with a thin, styled scrollbar and
 * `overscroll-behavior: contain`, so reaching the end doesn't scroll the page behind.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

export function ScrollArea({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="scroll-area"
			/*
			 * Focusable so it can be scrolled from the keyboard (WCAG 2.1.1). Before the spread, so a
			 * caller whose content is already reachable can pass `tabIndex={-1}`.
			 */
			tabIndex={0}
			className={cx("scroll-area--component", styles.scrollArea, className)}
			{...props}
		/>
	)
}
