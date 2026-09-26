// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "./button"

describe("render with no children of its own", () => {
	it("keeps the rendered element's own content", () => {
		/*
		 * Three-argument `cloneElement` with undefined children empties the element; a complete
		 * element passed with no children must keep its content.
		 */
		render(<Button render={<a href="/x">Go</a>} />)
		expect(screen.getByRole("link").textContent).toBe("Go")
	})

	it("still lets the component's own children win when it has them", () => {
		render(<Button render={<a href="/y" />}>Label</Button>)
		expect(screen.getByRole("link").textContent).toContain("Label")
	})
})

describe("other polymorphic components keep a render element's own content", () => {
	/*
	 * Other polymorphic components carry the same guard. SidebarMenuButton's assertion lives
	 * beside the sidebar, keeping its dependency graph out of this test.
	 */
	it("Badge", async () => {
		const { Badge } = await import("@/components/base/badge")
		render(<Badge render={<a href="/x">Go</a>} />)
		expect(screen.getByRole("link").textContent).toBe("Go")
	})
})
