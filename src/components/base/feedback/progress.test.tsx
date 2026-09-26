import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "./progress"
import { ProgressCircle } from "./progress-circle"

describe.each([
	["linear", (value: number, max: number) => <Progress value={value} max={max} label="Import" />],
	[
		"circular",
		(value: number, max: number) => (
			<ProgressCircle value={value} max={max} label="Import" />
		),
	],
] as const)("%s progress range normalization", (_kind, renderProgress) => {
	it.each([
		[-20, 80, 0, 80],
		[120, 80, 80, 80],
		[Number.NaN, 80, 0, 80],
		[Number.POSITIVE_INFINITY, 80, 0, 80],
		[30, 0, 30, 100],
		[30, -10, 30, 100],
		[30, Number.NaN, 30, 100],
		[30, Number.POSITIVE_INFINITY, 30, 100],
	])("normalizes value %s and max %s", (value, max, expectedValue, expectedMax) => {
		render(renderProgress(value, max))

		const progress = screen.getByRole("progressbar", { name: "Import" })
		expect(progress).toHaveAttribute("aria-valuemin", "0")
		expect(progress).toHaveAttribute("aria-valuenow", String(expectedValue))
		expect(progress).toHaveAttribute("aria-valuemax", String(expectedMax))
	})
})

it("uses the same finite percentage for linear and circular visuals", () => {
	const { container } = render(
		<>
			<Progress value={Number.NaN} max={0} label="Linear" />
			<ProgressCircle value={Number.NaN} max={0} label="Circle" />
		</>,
	)

	const fill = container.querySelector('[data-slot="progress"] > div')
	const circle = screen.getByRole("progressbar", { name: "Circle" })
	expect(fill).toHaveStyle({ width: "0%" })
	expect(circle).toHaveStyle({ "--progress-sweep": "0%" })
})

it("keeps the linear indeterminate contract free of value metadata", () => {
	render(<Progress max={0} label="Working" />)

	const progress = screen.getByRole("progressbar", { name: "Working" })
	expect(progress).not.toHaveAttribute("aria-valuemin")
	expect(progress).not.toHaveAttribute("aria-valuenow")
	expect(progress).not.toHaveAttribute("aria-valuemax")
})
