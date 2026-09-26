/**
 * Kbd — a key or chord as a native `<kbd>`. Pass a chord as one string ("⌘K"); nested
 * `Kbd`s are announced element by element.
 */
import type { ComponentProps } from "react"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
	return <kbd data-slot="kbd" className={cx("kbd--component", styles.kbd, className)} {...props} />
}

/** Several caps as a sequence ("⌘ then K"); the gap between caps marks it as a sequence, not a chord. */
export function KbdGroup({ className, ...props }: ComponentProps<"span">) {
	return (
		<span data-slot="kbd-group" className={cx("kbd-group--component", styles.kbdGroup, className)} {...props} />
	)
}
