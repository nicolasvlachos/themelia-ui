/** The value segment of a pill: up to two overlapped icons (then a count) before the label. */
import { CalendarIcon } from "lucide-react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { useFilters } from "./filter-store"
import { formatFilterValue, getFilterOption } from "./filter-utils"
import { FilterType, type FilterConfig } from "./filters.types"
import styles from "./filters.module.css"

export interface FilterValueDisplayProps {
	filter: FilterConfig
	value: string[]
	className?: string
}

export function FilterValueDisplay({ filter, value, className }: FilterValueDisplayProps) {
	const { strings, getAsyncOptionLabel } = useFilters()

	const text = formatFilterValue(filter, value, strings, (entry) =>
		getAsyncOptionLabel(filter.key, entry),
	)

	if (value.length === 0) {
		return (
			<Text tag="span" type="secondary" truncate className={className}>
				{strings.nothingSelected}
			</Text>
		)
	}

	const icons = value
		.slice(0, 2)
		.map((entry) => getFilterOption(filter, entry)?.icon)
		.filter(Boolean)

	return (
		<span className={cx("filter-value-display--component", styles.valueDisplay, className)}>
			{filter.type === FilterType.DATE && (
				<CalendarIcon aria-hidden className={styles.valueGlyph} />
			)}

			{icons.length > 0 && (
				<span className={styles.valueIcons}>
					{icons.map((icon, index) => (
						<span key={index} className={styles.valueIcon}>{icon}</span>
					))}
					{value.length > 2 && (
						<span className={styles.valueIconCount}>
							<Text tag="span" size="xs" weight="medium" numeric>+{value.length - 2}</Text>
						</span>
					)}
				</span>
			)}

			<Text tag="span" weight="medium" truncate>{text}</Text>
		</span>
	)
}
