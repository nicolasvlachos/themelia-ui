import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { ChartContainer, ChartTooltipContent, type ChartConfig } from "./chart"

/* jsdom has no layout, so the responsive wrapper would render nothing (vi.mock is hoisted). */
vi.mock("recharts", async (importOriginal) => ({
	...(await importOriginal<typeof import("recharts")>()),
	ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
}))

const config: ChartConfig = {
	visitors: { label: "Visitors" },
	chrome: { label: "Chrome" },
	safari: { label: "Safari" },
}

const row = (browser: string, visitors: number) => ({
	dataKey: "visitors",
	name: browser,
	value: visitors,
	payload: { browser, visitors, month: "safari" },
})

describe("ChartTooltipContent payload keys", () => {
	it("reads nameKey and labelKey from the payload, not the config", () => {
		render(
			<ChartContainer config={config}>
				<ChartTooltipContent active payload={[row("chrome", 275), row("safari", 200)]} nameKey="browser" labelKey="month" />
			</ChartContainer>,
		)
		expect(screen.getByText("Chrome")).toBeInTheDocument()
		// The label is the payload's `month` value, resolved through the config.
		expect(screen.getAllByText("Safari")).toHaveLength(2)
		expect(screen.queryByText("Visitors")).not.toBeInTheDocument()
	})
})
