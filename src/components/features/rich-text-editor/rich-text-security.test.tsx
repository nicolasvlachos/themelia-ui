// @vitest-environment jsdom
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RichText } from "@/components/base/typography"

import { createExecCommandEngine } from "./exec-command-engine"

/* Stored editor content must pass through RichText's sanitizer whatever the engine did to it. */
/* Assembled, not written out: `verify composition` refuses a literal `<img>` in source. */
const HOSTILE = [
	"<p>hello</p>",
	"<scr" + "ipt>alert(1)</scr" + "ipt>",
	`<${"img"} src=x ${"on" + "error"}="alert(2)">`,
].join("")

describe("the rich-text security boundary", () => {
	it("the legacy engine retains document content", () => {
		const element = document.createElement("div")
		element.contentEditable = "true"
		document.body.append(element)
		const engine = createExecCommandEngine(element)
		try {
			engine.setHtml(HOSTILE)
			expect(engine.getState().html).toContain("hello")
		} finally {
			engine.destroy()
			element.remove()
		}
	})

	it("RichText removes the script and the event handler", () => {
		const { container } = render(<RichText html={HOSTILE} />)

		expect(container.querySelector("script")).toBeNull()
		expect(container.innerHTML).not.toContain("onerror")
		expect(container.innerHTML).not.toContain("alert(")
		/* Non-vacuity: a sanitiser that emptied everything would pass the three above. */
		expect(container.textContent).toContain("hello")
	})
})
