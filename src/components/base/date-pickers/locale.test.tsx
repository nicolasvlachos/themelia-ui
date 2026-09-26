import { render, screen } from "@testing-library/react"
import { de } from "date-fns/locale"
import { describe, expect, it } from "vitest"

import { UIRoot } from "@/lib/ui-provider"

import type { DatePreset, DateRangeValue } from "./calendar.types"
import { MonthYearPicker } from "./month-year-picker"
import { createRangePresets } from "./presets"

/**
 * The locale contract: range presets honour `weekStartsOn` and translated labels; month
 * names follow the provider's date-fns locale. Neither is visible on a preview route.
 */
/** Narrows a preset to a range, failing loudly if it isn't one. */
function range(preset: DatePreset | undefined): DateRangeValue {
	const value = preset?.value()
	if (!value || value instanceof Date || Array.isArray(value)) {
		throw new Error("expected a range preset")
	}
	return value
}

describe("range presets", () => {
	/* A Wednesday, so the assertions test the week boundary, not month arithmetic. */
	const now = () => new Date(2026, 8, 2, 12, 0, 0)

	it("starts the week on Monday when the provider says Monday", () => {
		const presets = createRangePresets({ weekStartsOn: 1, now })
		const week = range(presets.find((preset) => preset.label === "This week"))

		expect(week.from?.getDay(), "Monday").toBe(1)
		expect(week.from?.getDate()).toBe(31)
		expect(week.to?.getDay(), "Sunday").toBe(0)
	})

	it("starts the week on Sunday when the provider says Sunday", () => {
		const presets = createRangePresets({ weekStartsOn: 0, now })
		const week = range(presets.find((preset) => preset.label === "This week"))

		expect(week.from?.getDay(), "Sunday").toBe(0)
		expect(week.from?.getDate()).toBe(30)
		expect(week.to?.getDay(), "Saturday").toBe(6)
	})

	it("the two week starts really do differ", () => {
		/* Guards against both branches silently taking date-fns's default. */
		const monday = range(createRangePresets({ weekStartsOn: 1, now })[2])
		const sunday = range(createRangePresets({ weekStartsOn: 0, now })[2])

		expect(monday.from?.getTime()).not.toBe(sunday.from?.getTime())
	})

	it("takes translated labels", () => {
		const presets = createRangePresets({ strings: { thisWeek: "Diese Woche" }, now })

		expect(presets.map((preset) => preset.label)).toContain("Diese Woche")
	})

	it("a partial override keeps its siblings", () => {
		/* The failure a shallow merge of the whole object would cause. */
		const presets = createRangePresets({ strings: { thisWeek: "Diese Woche" }, now })
		const labels = presets.map((preset) => preset.label)

		expect(labels).toContain("Last 7 days")
		expect(labels).toContain("Last year")
		expect(labels).toHaveLength(7)
	})

	it("resolves against the injected clock, not the wall clock", () => {
		/* Makes the assertions above deterministic. */
		const last7 = range(createRangePresets({ now })[0])

		expect(last7.to?.getFullYear()).toBe(2026)
		expect(last7.to?.getMonth()).toBe(8)
	})
})

describe("month names follow the provider's locale", () => {
	it("renders German month names inside a German root", () => {
		render(
			<UIRoot config={{ dates: { locale: de } }}>
				<MonthYearPicker value={{ month: 0, year: 2026 }} />
			</UIRoot>,
		)

		/* "März" in German, "Mar" in English — date-fns abbreviates the others with a period. */
		expect(screen.getByText("März")).toBeInTheDocument()
		expect(screen.getByText("Okt.")).toBeInTheDocument()
	})

	it("renders English month names with no locale configured", () => {
		render(<MonthYearPicker value={{ month: 0, year: 2026 }} />)

		expect(screen.getByText("Mar")).toBeInTheDocument()
	})
})
