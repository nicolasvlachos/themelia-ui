/**
 * Kbd — a key or chord as a native `<kbd>`. Pass a chord as one string ("⌘K"); nested
 * `Kbd`s are announced element by element.
 */
import type { ComponentProps } from "react"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

/**
 * One key, or one chord pressed together written as a single string — "⌘K", not three caps,
 * because nested `Kbd`s are announced element by element. A native `<kbd>`: every native
 * attribute passes through.
 */
export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
	return <kbd data-slot="kbd" className={cx("kbd--component", styles.kbd, className)} {...props} />
}

/**
 * Several `Kbd` in a row, for a sequence pressed one after another — "G then I". The caps sit
 * further apart than the characters inside one, and that gap is what tells a reader the keys
 * are pressed in turn rather than together.
 */
export function KbdGroup({ className, ...props }: ComponentProps<"span">) {
	return (
		<span data-slot="kbd-group" className={cx("kbd-group--component", styles.kbdGroup, className)} {...props} />
	)
}
