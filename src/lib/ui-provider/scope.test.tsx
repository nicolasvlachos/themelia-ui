import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Scope } from "./scope"

describe("Scope", () => {
	it("carries its variables and leaves layout alone", () => {
		const { container } = render(
			<Scope vars={{ "--control-height": "2rem" }}>
				<span>x</span>
			</Scope>,
		)

		const scope = container.firstElementChild as HTMLElement
		expect(scope.tagName).toBe("DIV")
		expect(scope.hasAttribute("data-ui-scope")).toBe(true)
		expect(scope.style.getPropertyValue("--control-height")).toBe("2rem")
		expect(scope.style.display).toBe("contents")
	})

	it("renders the element passed to render, with its own props", () => {
		const { container } = render(
			<Scope vars={{ "--gap": "1.5rem" }} render={<section aria-label="Toolbar region" />} transparent={false} id="tools">
				<span>x</span>
			</Scope>,
		)

		const scope = container.querySelector("section")
		expect(scope?.hasAttribute("data-ui-scope")).toBe(true)
		expect(scope?.getAttribute("aria-label")).toBe("Toolbar region")
		expect(scope?.id).toBe("tools")
		expect(scope?.style.getPropertyValue("--gap")).toBe("1.5rem")
		expect(scope?.style.display).toBe("")
		expect(scope?.textContent).toBe("x")
	})
})
