// @vitest-environment jsdom
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RichText } from "./rich-text"

describe("RichText", () => {
	it("renders the sanitised markup it was given", () => {
		// `Text` must treat `dangerouslySetInnerHTML` as content, not return null.
		const { container } = render(<RichText html="<p>hello</p>" />)
		expect(container.textContent).toContain("hello")
		expect(container.querySelector("p")).not.toBeNull()
	})

	it("still renders nothing when the markup is empty", () => {
		/* An empty Text still renders nothing. */
		const { container } = render(<RichText html="" />)
		expect(container.innerHTML).toBe("")
	})

	it("still renders nothing when everything is stripped", () => {
		const { container } = render(<RichText html="<script>alert(1)</script>" />)
		expect(container.innerHTML).toBe("")
	})

	it("renders children when given them instead", () => {
		const { container } = render(<RichText>plain</RichText>)
		expect(container.textContent).toBe("plain")
	})
})
