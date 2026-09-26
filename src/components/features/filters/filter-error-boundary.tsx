/**
 * Keeps one broken filter (custom render, fetched options, consumer value shapes) from
 * unmounting the page. A class, because error boundaries have no hook; the function
 * wrapper supplies copy and the reporter from context.
 */
import { XIcon } from "lucide-react"
import { Component, useMemo, type ErrorInfo, type ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { useFilters } from "./filter-store"
import type { FilterErrorHandler } from "./filters.types"
import styles from "./filters.module.css"

export interface FilterErrorBoundaryProps {
	children: ReactNode
	/** Which filter this content edits. Names the filter in the message. */
	filterKey?: string
	/** Replaces the default message entirely. */
	fallback?: ReactNode
	className?: string
}

interface BoundaryLabels {
	title: string
	describe: (filterKey?: string) => string
	retry: string
}

interface BoundaryState {
	error: Error | null
}

class FilterErrorBoundaryBase extends Component<
	FilterErrorBoundaryProps & { labels: BoundaryLabels; onError: FilterErrorHandler },
	BoundaryState
> {
	public state: BoundaryState = { error: null }

	public static getDerivedStateFromError(error: Error): BoundaryState {
		return { error }
	}

	public componentDidCatch(error: Error, info: ErrorInfo) {
		/* Reported through `onError`, not logged. */
		this.props.onError(error, {
			phase: "render",
			filterKey: this.props.filterKey,
			info: info.componentStack ?? undefined,
		})
	}

	private retry = () => this.setState({ error: null })

	public render() {
		const { children, fallback, filterKey, labels, className } = this.props
		if (!this.state.error) return children
		if (fallback) return fallback

		return (
			<div className={cx("filter-error-boundary--component", styles.errorBoundary, className)}>
				<div className={styles.errorBoundaryHead}>
					<Text tag="span" type="inherit" weight="semibold">{labels.title}</Text>
					{/* Retry: clearing the state re-renders the child. */}
					<Button
						type="button"
						tone="destructive"
						buttonStyle="ghost"
						iconOnly
						aria-label={labels.retry}
						onClick={this.retry}
					>
						<XIcon />
					</Button>
				</div>
				<Text type="inherit">{labels.describe(filterKey)}</Text>
				<MonoValue size="xs" type="inherit" className={styles.errorBoundaryDetail}>
					{this.state.error.message}
				</MonoValue>
			</div>
		)
	}
}

export function FilterErrorBoundary(props: FilterErrorBoundaryProps) {
	const { strings, reportError } = useFilters()

	const labels = useMemo<BoundaryLabels>(
		() => ({
			title: strings.error.title,
			describe: strings.error.describe,
			retry: strings.error.retry,
		}),
		[strings],
	)

	return <FilterErrorBoundaryBase {...props} labels={labels} onError={reportError} />
}
