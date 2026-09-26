import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Scope } from "./scope"

describe("Scope", () => {
	it("is a boundary that carries its variables and leaves layout alone", () => {
		const { container } = render(
			<Scope vars={{ "--density-scale": 0.8 }}>
				<span>x</span>
			</Scope>,
		)

		const scope = container.firstElementChild as HTMLElement
		expect(scope.tagName).toBe("DIV")
		expect(scope.hasAttribute("data-ui-scope")).toBe(true)
		expect(scope.style.getPropertyValue("--density-scale")).toBe("0.8")
		expect(scope.style.display).toBe("contents")
	})

	it("renders the element passed to render, with its own props", () => {
		const { container } = render(
			<Scope vars={{ "--scale": 1.1 }} render={<section aria-label="Toolbar region" />} transparent={false} id="tools">
				<span>x</span>
			</Scope>,
		)

		const scope = container.querySelector("section")
		expect(scope?.hasAttribute("data-ui-scope")).toBe(true)
		expect(scope?.getAttribute("aria-label")).toBe("Toolbar region")
		expect(scope?.id).toBe("tools")
		expect(scope?.style.getPropertyValue("--scale")).toBe("1.1")
		expect(scope?.style.display).toBe("")
		expect(scope?.textContent).toBe("x")
	})
})
