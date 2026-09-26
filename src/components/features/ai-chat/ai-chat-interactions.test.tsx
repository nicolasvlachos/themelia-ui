// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AiChatPromptInput } from "./ai-chat-parts"

describe("AiChatPromptInput interactions", () => {
	it("disables every built-in action when the composer is disabled", () => {
		render(
			<AiChatPromptInput
				value="Keep this draft"
				onValueChange={vi.fn()}
				onStop={vi.fn()}
				onAttach={vi.fn()}
				streaming
				disabled
			/>,
		)

		expect(screen.getByRole("textbox")).toBeDisabled()
		expect(screen.getByRole("button", { name: /attach/i })).toBeDisabled()
		expect(screen.getByRole("button", { name: /stop/i })).toBeDisabled()
	})

	it("does not expose enabled actions when their callbacks are absent", () => {
		const { rerender } = render(
			<AiChatPromptInput value="Ready to send" onValueChange={vi.fn()} showAttach />,
		)

		expect(screen.getByRole("button", { name: /attach/i })).toBeDisabled()
		expect(screen.getByRole("button", { name: /send|submit/i })).toBeDisabled()

		rerender(
			<AiChatPromptInput value="Keep this draft" onValueChange={vi.fn()} streaming />,
		)
		expect(screen.getByRole("button", { name: /stop/i })).toBeDisabled()
	})

	it("leaves Enter available for editing when there is no submit callback", () => {
		const onValueChange = vi.fn()
		render(<AiChatPromptInput value="Keep this draft" onValueChange={onValueChange} />)

		const input = screen.getByRole("textbox")
		const accepted = fireEvent.keyDown(input, { key: "Enter" })

		expect(accepted).toBe(true)
		expect(onValueChange).not.toHaveBeenCalled()
	})
})
