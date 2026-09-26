/**
 * ActivityHeatmap: a year of daily activity as Monday-aligned columns, built from the
 * data's own range (not today), so it is deterministic. Month labels keep a three-week gap.
 */
import type { ComponentProps, CSSProperties } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultActivityHeatmapStrings, type ActivityHeatmapStrings } from "./analytics.strings"
import styles from "./analytics.module.css"

/** Five buckets, because five is what a reader can still tell apart at 12px. */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export interface ActivityHeatmapDay {
	/** `YYYY-MM-DD`. */
	date: string
	level: ActivityLevel
}

export interface ActivityHeatmapProps extends Omit<ComponentProps<"div">, "children"> {
	data: readonly ActivityHeatmapDay[]
	strings?: Partial<ActivityHeatmapStrings>
}

interface Calendar {
	weeks: (ActivityHeatmapDay | null)[][]
	months: { label: string; weekIndex: number }[]
}

function buildCalendar(data: readonly ActivityHeatmapDay[], monthNames: readonly string[]): Calendar {
	if (data.length === 0) return { weeks: [], months: [] }

	const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
	const first = sorted[0]
	const last = sorted[sorted.length - 1]
	if (!first || !last) return { weeks: [], months: [] }
	/* Local midnight: a bare `new Date("2026-03-01")` is UTC and shifts a day west of Greenwich. */
	const start = new Date(`${first.date}T00:00:00`)
	const end = new Date(`${last.date}T00:00:00`)

	// Back up to the Monday on or before the first day, so every column is a full week.
	const weekday = start.getDay()
	const cursor = new Date(start)
	cursor.setDate(cursor.getDate() + (weekday === 0 ? -6 : 1 - weekday))

	const levels = new Map(sorted.map((day) => [day.date, day.level]))
	const weeks: (ActivityHeatmapDay | null)[][] = []
	const months: { label: string; weekIndex: number }[] = []
	let week: (ActivityHeatmapDay | null)[] = []
	let lastMonth = -1

	while (cursor <= end) {
		const year = cursor.getFullYear()
		const month = String(cursor.getMonth() + 1).padStart(2, "0")
		const day = String(cursor.getDate()).padStart(2, "0")
		const date = `${year}-${month}-${day}`
		const dayIndex = (cursor.getDay() + 6) % 7

		if (dayIndex === 0 && week.length > 0) {
			weeks.push(week)
			week = []
		}

		if (cursor.getMonth() !== lastMonth) {
			const weekIndex = dayIndex === 0 ? weeks.length : weeks.length + 1
			const name = monthNames[cursor.getMonth()]
			if (name && !months.some((entry) => entry.weekIndex === weekIndex)) {
				months.push({ label: name, weekIndex })
			}
			lastMonth = cursor.getMonth()
		}

		week.push({ date, level: levels.get(date) ?? 0 })
		cursor.setDate(cursor.getDate() + 1)
	}

	if (week.length > 0) {
		// A short final week is padded so the column keeps its height.
		while (week.length < 7) week.push(null)
		weeks.push(week)
	}

	return { weeks, months }
}

const LEVELS: ActivityLevel[] = [0, 1, 2, 3, 4]

export function ActivityHeatmap({ data, strings, className, ...props }: ActivityHeatmapProps) {
	const copy = { ...defaultActivityHeatmapStrings, ...strings }
	const { weeks, months } = buildCalendar(data, copy.monthNames)

	/* Three columns is the closest two labels can sit before they overlap into a smear. */
	const visibleMonths = months.filter((month, index, all) => {
		const previous = all[index - 1]
		return !previous || month.weekIndex - previous.weekIndex >= 3
	})

	return (
		<div className={cx("activity-heatmap--component", styles.heatmap, className)} {...props}>
			<div className={styles.heatmapScroll}>
				<div className={styles.heatmapMonths} style={{ "--heatmap-weeks": weeks.length } as CSSProperties}>
					{visibleMonths.map((month) => (
						<Text
							key={`${month.label}-${month.weekIndex}`}
							size="xs"
							type="secondary"
							lineHeight="none"
							className={styles.heatmapMonth}
							style={{ "--heatmap-week": month.weekIndex } as CSSProperties}
						>
							{month.label}
						</Text>
					))}
				</div>

				<div className={styles.heatmapBody}>
					<div className={styles.heatmapDays}>
						{copy.dayLabels.map((label, index) => (
							<span key={index} className={styles.heatmapDay}>
								{label ? (
									<Text size="xs" type="secondary">
										{label}
									</Text>
								) : null}
							</span>
						))}
					</div>

					<div className={styles.heatmapWeeks}>
						{weeks.map((week, weekIndex) => (
							<div key={weekIndex} className={styles.heatmapWeek}>
								{week.map((day, dayIndex) => (
									<span
										key={dayIndex}
										data-level={day ? day.level : undefined}
										data-empty={day ? undefined : ""}
										className={styles.heatmapCell}
										title={day ? copy.formatDay(day.date, day.level) : undefined}
									/>
								))}
							</div>
						))}
					</div>
				</div>
			</div>

			<div className={styles.heatmapLegend}>
				<Text size="xs" type="secondary">
					{copy.legendLess}
				</Text>
				{LEVELS.map((level) => (
					<span key={level} data-level={level} className={styles.heatmapCell} aria-hidden="true" />
				))}
				<Text size="xs" type="secondary">
					{copy.legendMore}
				</Text>
			</div>
		</div>
	)
}
