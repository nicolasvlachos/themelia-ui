// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Copyable } from "./copyable"

const withClipboard = (writeText: (value: string) => Promise<void>) => {
	Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
}

const trigger = () => screen.getByRole("button")

afterEach(() => {
	Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })
	vi.useRealTimers()
})

describe("Copyable", () => {
	it("copies the value, not the display content", async () => {
		const writeText = vi.fn(async () => {})
		withClipboard(writeText)
		render(<Copyable value="sk-secret" displayValue="sk-…et" silent />)

		await act(async () => { trigger().click() })
		expect(writeText).toHaveBeenCalledWith("sk-secret")
	})

	it("confirms on the trigger's accessible name, then goes back", async () => {
		vi.useFakeTimers()
		withClipboard(async () => {})
		render(<Copyable value="abc" silent />)
		expect(trigger()).toHaveAccessibleName("Copy value")

		await act(async () => { trigger().click() })
		expect(trigger()).toHaveAccessibleName("Copied")

		await act(async () => { vi.advanceTimersByTime(2500) })
		expect(trigger()).toHaveAccessibleName("Copy value")
	})

	it("does not cut the second copy's confirmation short", async () => {
		vi.useFakeTimers()
		withClipboard(async () => {})
		render(<Copyable value="abc" silent />)

		await act(async () => { trigger().click() })
		await act(async () => { vi.advanceTimersByTime(1800) })
		await act(async () => { trigger().click() })

		/* Past the FIRST window but not the second: the second copy owns its own. */
		await act(async () => { vi.advanceTimersByTime(1000) })
		expect(trigger()).toHaveAccessibleName("Copied")
	})

	it("reports a refused clipboard through onError and stays uncopied", async () => {
		const onError = vi.fn()
		const onCopy = vi.fn()
		withClipboard(async () => { throw new Error("denied") })
		render(<Copyable value="abc" onError={onError} onCopy={onCopy} silent />)

		await act(async () => { trigger().click() })
		expect(onError).toHaveBeenCalled()
		expect(onCopy).not.toHaveBeenCalled()
		expect(trigger()).toHaveAccessibleName("Copy value")
	})

	it("survives an environment with no clipboard at all", async () => {
		const onError = vi.fn()
		render(<Copyable value="abc" onError={onError} silent />)
		await act(async () => { expect(() => trigger().click()).not.toThrow() })
		expect(onError).toHaveBeenCalled()
	})
})
