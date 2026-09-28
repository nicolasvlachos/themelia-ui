/** What the palette shows when a real query matched nothing. */
import { SearchIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Empty } from "@/components/base/feedback"
import { cx } from "@/lib/cx"

export interface GlobalSearchEmptyStateProps {
	title: ReactNode
	/** One line of guidance toward a next move. */
	hint?: ReactNode
	className?: string
}

/** What the palette shows after a search that found nothing. */
export function GlobalSearchEmptyState({ title, hint, className }: GlobalSearchEmptyStateProps) {
	return (
		<Empty
			title={title}
			description={hint}
			media={<SearchIcon />}
			mediaVariant="icon-soft"
			className={cx("global-search-empty-state--component", className)}
		/>
	)
}
