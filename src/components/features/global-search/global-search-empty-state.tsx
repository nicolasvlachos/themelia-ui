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

export function GlobalSearchEmptyState({ title, hint, className }: GlobalSearchEmptyStateProps) {
	return (
		<Empty
			title={title}
			description={hint}
			media={<SearchIcon />}
			mediaVariant="icon-soft"
			padding="md"
			className={cx("global-search-empty-state--component", className)}
		/>
	)
}
