/**
 * The category key, and optionally the filter: with filtering on, the whole chip toggles,
 * and hidden categories render dashed and muted.
 */
import { resolveStrings } from "@/lib/strings"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultEventCalendarStrings } from "./event-calendar.strings"
import { resolveCategoryColorToken, type EventCalendarLegendProps } from "./event-calendar.types"
import styles from "./event-calendar.module.css"

export function EventCalendarLegend({
	categories,
	visibleCategories,
	onToggleCategory,
	enableFiltering = false,
	strings,
	className,
}: EventCalendarLegendProps) {
	const copy = resolveStrings(defaultEventCalendarStrings, strings)
	if (categories.length === 0) return null

	// Empty means all.
	const showingAll = !visibleCategories || visibleCategories.length === 0

	return (
		<div
			role={enableFiltering ? "group" : undefined}
			aria-label={enableFiltering ? copy.filterCategories : undefined}
			className={cx("event-calendar-legend--component", styles.legend, className)}
		>
			{categories.map((category) => {
				const visible = !enableFiltering || showingAll || !!visibleCategories?.includes(category.id)
				const content = (
					<>
						<span
							aria-hidden
							data-token={visible ? resolveCategoryColorToken(category) : undefined}
							className={styles.swatch}
						/>
						{!!category.icon && <span className={styles.legendIcon}>{category.icon}</span>}
						<Text tag="span" size="xs" weight="medium" type={visible ? "main" : "secondary"}>
							{category.label}
						</Text>
					</>
				)

				if (!enableFiltering || !onToggleCategory) {
					return (
						<span key={category.id} className={styles.chip}>
							{content}
						</span>
					)
				}

				return (
					<button
						key={category.id}
						type="button"
						aria-pressed={visible}
						data-off={!visible || undefined}
						className={cx(styles.chip, styles.chipButton)}
						onClick={() => onToggleCategory(category.id)}
					>
						{content}
					</button>
				)
			})}
		</div>
	)
}
