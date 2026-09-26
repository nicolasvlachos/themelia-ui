import {
	endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear, subDays,
	subMonths, subYears,
} from "date-fns"

import type { DatePreset } from "./calendar.types"
import { defaultRangePresetStrings, type RangePresetStrings } from "./date-pickers.strings"

export interface RangePresetOptions {
	/** Overrides the seven preset labels. */
	strings?: Partial<RangePresetStrings>
	/**
	 * Which day a week starts on; pass the provider's `dates.weekStartsOn`. Unset falls back to
	 * date-fns (Sunday), which disagrees with the provider's Monday default.
	 */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	/**
	 * What "now" is, injectable for tests. A function so presets stay correct on a page left
	 * open past midnight.
	 */
	now?: () => Date
}

/** The usual reporting-range shortcuts, in the caller's language and on the caller's week. */
export function createRangePresets({
	strings,
	weekStartsOn,
	now = () => new Date(),
}: RangePresetOptions = {}): DatePreset[] {
	const copy = { ...defaultRangePresetStrings, ...strings }
	const week = weekStartsOn === undefined ? undefined : { weekStartsOn }

	return [
		{ label: copy.last7Days, value: () => ({ from: subDays(now(), 6), to: now() }) },
		{ label: copy.last30Days, value: () => ({ from: subDays(now(), 29), to: now() }) },
		{
			label: copy.thisWeek,
			value: () => ({ from: startOfWeek(now(), week), to: endOfWeek(now(), week) }),
		},
		{ label: copy.thisMonth, value: () => ({ from: startOfMonth(now()), to: endOfMonth(now()) }) },
		{
			label: copy.lastMonth,
			value: () => {
				const previous = subMonths(now(), 1)
				return { from: startOfMonth(previous), to: endOfMonth(previous) }
			},
		},
		{ label: copy.thisYear, value: () => ({ from: startOfYear(now()), to: endOfYear(now()) }) },
		{
			label: copy.lastYear,
			value: () => {
				const previous = subYears(now(), 1)
				return { from: startOfYear(previous), to: endOfYear(previous) }
			},
		},
	]
}
