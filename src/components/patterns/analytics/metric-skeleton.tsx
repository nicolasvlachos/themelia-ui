/**
 * MetricSkeleton: a Metric's loading placeholder, shaped per variant so tiles keep their
 * size when the data lands.
 */
import type { ComponentProps } from "react"

import { ContentBlock } from "@/components/base/display"
import { Skeleton } from "@/components/base/skeleton"
import { cx } from "@/lib/cx"

import type { MetricVariant } from "./analytics.types"
import styles from "./analytics.module.css"

export interface MetricSkeletonProps extends ComponentProps<"div"> {
	variant?: MetricVariant
}

export function MetricSkeleton({ variant = "default", className, ...props }: MetricSkeletonProps) {
	return (
		<ContentBlock
			/* Only `accent` reserves a framed box; the rest sit inside their existing frame. */
			surface={variant === "accent" ? "card" : "plain"}
			data-variant={variant}
			// `busy`, not `hidden`: the region exists and is loading.
			aria-busy="true"
			className={cx("metric-skeleton--component", styles.metricSkeleton, className)}
			{...props}
		>
			<Skeleton className={styles.skeletonLabel} />
			<Skeleton className={styles.skeletonValue} />
			{variant !== "minimal" && variant !== "compact" && <Skeleton className={styles.skeletonSpark} />}
		</ContentBlock>
	)
}
