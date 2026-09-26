/** Duration: an elapsed span, not a clock time. `maxParts` trims the tail ("2 hours 14 minutes"). */
import type { ReactNode, Ref } from "react"

import { formatDuration, type DurationUnit, type DurationUnitDisplay } from "@/lib/format"
import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"

export interface DurationProps extends SpanProps {
	/** The length. Seconds unless `from` says otherwise. */
	value?: number | null
	/** The unit the incoming value is in. */
	from?: DurationUnit
	locale?: string
	/**
	 * How many units to show before truncating. "2 hours 14 minutes 3 seconds" is rarely
	 * useful — the reader wants the magnitude, and the tail is noise.
	 */
	maxParts?: number
	/** How each unit is written. */
	unitDisplay?: DurationUnitDisplay
	minimumFractionDigits?: number
	maximumFractionDigits?: number
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

export function Duration({
	value,
	from,
	locale,
	maxParts,
	unitDisplay,
	minimumFractionDigits,
	maximumFractionDigits,
	...props
}: DurationProps) {
	const { locale: scopeLocale } = useFormatting()
	return (
		<ValueRoot hook="duration" {...props}>
			{value === null || value === undefined
				? undefined
				: formatDuration(value, {
						from,
						locale: locale ?? scopeLocale,
						maxParts,
						unitDisplay,
						minimumFractionDigits,
						maximumFractionDigits,
					})}
		</ValueRoot>
	)
}
