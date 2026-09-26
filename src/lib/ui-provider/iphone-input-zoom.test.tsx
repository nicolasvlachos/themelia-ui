import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { UIProvider } from "./provider"

afterEach(() => vi.restoreAllMocks())

describe("iPhone input zoom policy", () => {
	it.each(["iPhone", "iPad", "Macintosh", "Android"])("requires an explicit opt-in and an iPhone (%s)", (device) => {
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue(`Mozilla/5.0 (${device})`)
		const { rerender } = render(<UIProvider><span data-testid="field" /></UIProvider>)
		expect(screen.getByTestId("field").parentElement).toHaveAttribute("data-iphone-input-zoom", "false")
		rerender(<UIProvider config={{ forms: { preventIPhoneZoom: true } }}><span data-testid="field" /></UIProvider>)
		expect(screen.getByTestId("field").parentElement).toHaveAttribute("data-iphone-input-zoom", String(device === "iPhone"))
		expect(document.documentElement).toHaveAttribute("data-iphone-input-zoom", String(device === "iPhone"))
	})

	it("allows nested opt-out and restores the document on unmount", () => {
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone)")
		const { unmount } = render(<UIProvider config={{ forms: { preventIPhoneZoom: true } }}>
			<UIProvider><span data-testid="inherited" /></UIProvider>
			<UIProvider config={{ forms: { preventIPhoneZoom: false } }}><span data-testid="disabled" /></UIProvider>
		</UIProvider>)
		expect(screen.getByTestId("inherited").parentElement).toHaveAttribute("data-iphone-input-zoom", "true")
		expect(screen.getByTestId("disabled").parentElement).toHaveAttribute("data-iphone-input-zoom", "false")
		unmount()
		expect(document.documentElement).not.toHaveAttribute("data-iphone-input-zoom")
	})

	it("renders a stable server snapshot before device detection", () => {
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone)")
		expect(renderToString(<UIProvider config={{ forms: { preventIPhoneZoom: true } }}>Field</UIProvider>))
			.toContain('data-iphone-input-zoom="false"')
	})
})
