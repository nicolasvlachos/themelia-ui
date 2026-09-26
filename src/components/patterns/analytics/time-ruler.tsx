/**
 * TimeRuler: twenty-four hours as one bar, shaded by activity. Bands are levels styled in
 * CSS from the primary ramp; the peak hour is ringed; a "now" marker is optional.
 */
import type { ComponentProps, CSSProperties } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultTimeRulerStrings, type TimeRulerStrings } from "./analytics.strings"
import styles from "./analytics.module.css"

export interface TimeRulerProps extends Omit<ComponentProps<"div">, "children"> {
	/** Twenty-four counts, midnight first. */
	hours: number[]
	/** 0–23. Pins the marker; omit it when the ruler is not about today. */
	currentHour?: number
	strings?: Partial<TimeRulerStrings>
}

/** Four bands, not a continuous ramp: four shades can be ranked, 24 cannot. */
function bandFor(count: number, max: number): 0 | 1 | 2 | 3 {
	if (count === 0) return 0
	const ratio = count / max
	if (ratio < 1 / 3) return 1
	if (ratio < 2 / 3) return 2
	return 3
}

export function TimeRuler({ hours, currentHour, strings, className, ...props }: TimeRulerProps) {
	const copy = { ...defaultTimeRulerStrings, ...strings }
	// At least 1, so an all-zero day does not divide by zero.
	const max = Math.max(...hours, 1)
	const peak = hours.indexOf(Math.max(...hours))
	const showMarker = currentHour !== undefined && currentHour >= 0 && currentHour < 24

	return (
		<div className={cx("time-ruler--component", styles.ruler, className)} {...props}>
			<div className={styles.rulerBar}>
				{hours.map((count, hour) => (
					<span
						key={hour}
						data-band={bandFor(count, max)}
						data-peak={hour === peak ? "" : undefined}
						className={styles.rulerHour}
						title={copy.formatHourTitle(copy.formatHour(hour), count)}
					/>
				))}
				{showMarker && (
					<span
						aria-hidden="true"
						className={styles.rulerMarker}
						style={{ "--ruler-now": currentHour } as CSSProperties}
					/>
				)}
			</div>

			<div className={styles.rulerTicks}>
				{hours.map((_, hour) => (
					<span key={hour} className={styles.rulerTick}>
						{/* Every fourth hour, so labels do not collide. */}
						{hour % 4 === 0 && (
							<Text size="xs" type="secondary" numeric>
								{copy.formatHour(hour)}
							</Text>
						)}
					</span>
				))}
			</div>

			<div className={styles.rulerLegend}>
				{([0, 1, 2, 3] as const).map((band) => (
					<span key={band} className={styles.rulerLegendItem}>
						<span data-band={band} className={styles.rulerSwatch} aria-hidden="true" />
						<Text size="xs" type="secondary">
							{[copy.legendNone, copy.legendLow, copy.legendMedium, copy.legendHigh][band]}
						</Text>
					</span>
				))}
				{showMarker && (
					<span className={styles.rulerLegendItem}>
						<span className={styles.rulerMarkerSwatch} aria-hidden="true" />
						<Text size="xs" type="secondary">
							{copy.legendNow}
						</Text>
					</span>
				)}
			</div>
		</div>
	)
}
