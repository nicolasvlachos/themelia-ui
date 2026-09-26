import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { MentionContent } from "./mention-content"

const mentions = [{ id: "user:1", kind: "user", label: "Maria" }]
const chip = '<span data-ref-id="user:1">Old name</span>'

describe("mention content structure", () => {
	it("keeps a live mention inside its paragraph and formatting", () => {
		const { container } = render(<MentionContent html={`<p>Hello <strong>${chip}</strong>, thanks!</p><p>Next paragraph.</p>`} mentions={mentions} />)
		expect(container.querySelectorAll("p")).toHaveLength(2)
		expect(container.querySelector("p")?.textContent).toBe("Hello Maria, thanks!")
		expect(container.querySelector("strong [data-ref-id]")).toHaveTextContent("Maria")
	})
	it("preserves lists, unknown references, entities and live custom chips", () => {
		const { container } = render(<MentionContent html={`<ul><li>A &amp; ${chip}</li><li><span data-ref-id="unknown">Someone else</span></li></ul>`} mentions={mentions} renderMention={m => <button>{m.label}</button>} />)
		expect(container.querySelectorAll("li")).toHaveLength(2)
		expect(screen.getByRole("button", { name: "Maria" }).closest("li")).toHaveTextContent("A & Maria")
		expect(container.querySelectorAll("li")[1]).toHaveTextContent("Someone else")
	})
	it("keeps sanitization and server rendering intact", () => {
		const html = renderToStaticMarkup(<MentionContent html={`<p>${chip}<script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">bad</a></p>`} mentions={mentions} />)
		expect(html).toContain("Maria")
		expect(html).not.toMatch(/<script|javascript:|onclick/)
	})
})
