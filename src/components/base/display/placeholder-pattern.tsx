/**
 * PlaceholderPattern — hatching for a deliberately empty region (a chart with no data, a
 * slot awaiting an upload). Not a Skeleton, which says "loading".
 */
import type { ComponentProps } from "react"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

export type PlaceholderPatternProps = ComponentProps<"div">

export function PlaceholderPattern({ className, ...props }: PlaceholderPatternProps) {
	return (
		<div
			aria-hidden
			className={cx("placeholder-pattern--component", styles.placeholderPattern, className)}
			{...props}
		/>
	)
}
