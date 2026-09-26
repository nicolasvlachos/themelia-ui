// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AiCodeBlock } from "./ai-content-surfaces"

const copyButton = () => screen.getByRole("button", { name: /copy/i })

afterEach(() => {
	Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })
})

describe("AiCodeBlock copy", () => {
	it("reports the copy only once the value is actually written", async () => {
		const onCopy = vi.fn()
		const writeText = vi.fn(async () => {})
		Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
		render(<AiCodeBlock code="npm i" language="bash" onCopy={onCopy} />)

		await act(async () => { copyButton().click() })
		expect(writeText).toHaveBeenCalledWith("npm i")
		expect(onCopy).toHaveBeenCalled()
	})

	it("does not claim a copy when there is no clipboard to write to", async () => {
		/* Without a clipboard, neither the copied state nor `onCopy` may fire. */
		const onCopy = vi.fn()
		render(<AiCodeBlock code="npm i" language="bash" onCopy={onCopy} />)

		await act(async () => { expect(() => copyButton().click()).not.toThrow() })
		expect(onCopy).not.toHaveBeenCalled()
	})
})
