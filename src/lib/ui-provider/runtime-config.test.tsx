import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"

import { Button } from "@/components/base/buttons"
import { Number as NumberValue } from "@/components/primitives"
import { UIProvider } from "./provider"
import type { UIConfig } from "./types"

function Preview({ config }: { config: UIConfig }) {
	return (
		<UIProvider config={config}>
			<NumberValue value={1234.56} />
			<Button>Save</Button>
		</UIProvider>
	)
}

it("updates mounted formatting and control defaults when the provider config changes", () => {
	const view = render(<Preview config={{
		formatting: { locale: "en-US" }, defaults: { button: { tone: "primary" } },
	}} />)
	const number = screen.getByText("1,234.56")
	const button = screen.getByRole("button", { name: "Save" })
	expect(button).toHaveAttribute("data-tone", "primary")

	view.rerender(<Preview config={{
		formatting: { locale: "de-DE" }, defaults: { button: { tone: "destructive" } },
	}} />)
	expect(screen.getByText("1.234,56")).toBe(number)
	expect(screen.getByRole("button", { name: "Save" })).toBe(button)
	expect(button).toHaveAttribute("data-tone", "destructive")
})
