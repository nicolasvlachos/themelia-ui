import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { FormField } from "@/components/base/forms"

import { TimePicker, type TimeValue } from "./time-picker"

function Field({ step = 15 }: { step?: number }) {
	const [time, setTime] = useState<TimeValue>({ hours: 9, minutes: 0 })
	return (
		<FormField label="Start time">
			<TimePicker value={time} onValueChange={setTime} minuteStep={step} />
		</FormField>
	)
}

const typeDigits = (input: HTMLElement, digits: string) => {
	for (const key of digits) fireEvent.keyDown(input, { key })
}

describe("TimePicker segments", () => {
	it("lets minutes be typed with a step, snapping only when the entry is complete", () => {
		render(<Field />)
		const minutes = screen.getByRole("spinbutton", { name: "Start time Minutes" })
		typeDigits(minutes, "4")
		expect(minutes).toHaveValue("4")
		typeDigits(minutes, "5")
		expect(minutes).toHaveValue("45")
		typeDigits(minutes, "5")
		fireEvent.blur(minutes)
		expect(minutes).toHaveValue("00")
	})

	it("steps with the arrow keys and wraps", () => {
		render(<Field />)
		const hours = screen.getByRole("spinbutton", { name: "Start time Hours" })
		fireEvent.keyDown(hours, { key: "ArrowDown" })
		expect(hours).toHaveValue("08")
		const minutes = screen.getByRole("spinbutton", { name: "Start time Minutes" })
		fireEvent.keyDown(minutes, { key: "ArrowDown" })
		expect(minutes).toHaveValue("45")
		expect(minutes).toHaveAttribute("aria-valuenow", "45")
	})

	it("clamps a typed value rather than wrapping it", () => {
		render(<Field step={1} />)
		const minutes = screen.getByRole("spinbutton", { name: "Start time Minutes" })
		typeDigits(minutes, "75")
		expect(minutes).toHaveValue("59")
	})
})
