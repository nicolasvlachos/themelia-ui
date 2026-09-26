import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { UIRoot } from "./root"
import { UIScope } from "./ui-scope"

/**
 * `UIRoot` and `UIScope` document ownership: unmount, competing roots, and nested scopes.
 * None of it is visible to the screenshot suite.
 */
describe("UIRoot", () => {
	it("renders no element of its own", () => {
		const { container } = render(
			<UIRoot>
				<span data-testid="child">x</span>
			</UIRoot>,
		)

		/* A wrapper would break flex and grid parents expecting the real child. */
		expect(container.firstElementChild?.tagName).toBe("SPAN")
	})

	it("leaves the document alone unless asked", () => {
		render(
			<UIRoot config={{ colorScheme: "dark" }}>
				<span>x</span>
			</UIRoot>,
		)

		expect(document.documentElement.getAttribute("data-theme")).toBeNull()
		expect(document.body.getAttribute("data-theme")).toBeNull()
	})

	it("writes to the document only when given a target", () => {
		render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>x</span>
			</UIRoot>,
		)

		expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
	})

	it("restores what was there before, rather than removing it", () => {
		/* An application that manages its own theme must get it back. */
		document.documentElement.setAttribute("data-theme", "light")

		const { unmount } = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>x</span>
			</UIRoot>,
		)
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark")

		unmount()
		expect(document.documentElement.getAttribute("data-theme")).toBe("light")
	})

	it("does not leave an attribute behind that was not there before", () => {
		const { unmount } = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>x</span>
			</UIRoot>,
		)
		unmount()

		expect(document.documentElement.getAttribute("data-theme")).toBeNull()
	})

	it("gives the document one owner when two roots mount", () => {
		/* A host application and an embedded widget both believe they are the top. */
		const host = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>host</span>
			</UIRoot>,
		)
		const widget = render(
			<UIRoot config={{ colorScheme: "light" }} documentTarget="documentElement">
				<span>widget</span>
			</UIRoot>,
		)

		/* The first to claim it keeps it. */
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark")

		widget.unmount()
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark")

		host.unmount()
		expect(document.documentElement.getAttribute("data-theme")).toBeNull()
	})

	/* ── Handing the document over: the oldest mounted request owns the target. ── */
	it("hands the document to the next root when the owner unmounts", () => {
		const host = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>host</span>
			</UIRoot>,
		)
		const widget = render(
			<UIRoot config={{ colorScheme: "light" }} documentTarget="documentElement">
				<span>widget</span>
			</UIRoot>,
		)

		expect(document.documentElement.dataset.theme).toBe("dark")

		host.unmount()
		expect(document.documentElement.dataset.theme).toBe("light")

		widget.unmount()
		expect(document.documentElement.dataset.theme).toBeUndefined()
	})

	it("restores what was there before the FIRST root, not what the last one wrote", () => {
		/* The snapshot belongs to the target, taken before the first write, not per root. */
		document.documentElement.setAttribute("data-theme", "sepia")

		const host = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>host</span>
			</UIRoot>,
		)
		const widget = render(
			<UIRoot config={{ colorScheme: "light" }} documentTarget="documentElement">
				<span>widget</span>
			</UIRoot>,
		)

		host.unmount()
		expect(document.documentElement.dataset.theme).toBe("light")

		widget.unmount()
		expect(document.documentElement.dataset.theme).toBe("sepia")

		document.documentElement.removeAttribute("data-theme")
	})

	it("tracks each target separately", () => {
		/* `body` and `documentElement` are two documents as far as ownership goes. */
		const onRoot = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>root</span>
			</UIRoot>,
		)
		const onBody = render(
			<UIRoot config={{ colorScheme: "light" }} documentTarget="body">
				<span>body</span>
			</UIRoot>,
		)

		/* Neither blocks the other: they are not competing for the same element. */
		expect(document.documentElement.dataset.theme).toBe("dark")
		expect(document.body.dataset.theme).toBe("light")

		onRoot.unmount()
		expect(document.documentElement.dataset.theme).toBeUndefined()
		expect(document.body.dataset.theme).toBe("light")

		onBody.unmount()
		expect(document.body.dataset.theme).toBeUndefined()
	})

	it("keeps ownership when the owner's own config changes", () => {
		/*
		 * A config change re-runs the effect cleanup first; the host must not lose its place.
		 * It changes something the widget never sets, so the assertion can tell them apart.
		 */
		const host = render(
			<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
				<span>host</span>
			</UIRoot>,
		)
		render(
			<UIRoot config={{ colorScheme: "light" }} documentTarget="documentElement">
				<span>widget</span>
			</UIRoot>,
		)

		host.rerender(
			<UIRoot config={{ colorScheme: "dark", density: "compact" }} documentTarget="documentElement">
				<span>host</span>
			</UIRoot>,
		)

		expect(document.documentElement.dataset.theme).toBe("dark")
		expect(document.documentElement.dataset.density).toBe("compact")
	})
})

describe("UIScope", () => {
	it("does not reset an inherited value it was not given", () => {
		/* Attributes come from the resolved config, so a nested boundary keeps the theme. */
		const { container } = render(
			<UIScope config={{ colorScheme: "dark" }} transparent={false}>
				<UIScope config={{ density: "compact" }} transparent={false}>
					<span>x</span>
				</UIScope>
			</UIScope>,
		)

		const inner = container.querySelector("[data-density]")
		expect(inner?.getAttribute("data-density")).toBe("compact")
		expect(inner?.getAttribute("data-theme")).toBe("dark")
	})

	it("never touches the document", () => {
		render(
			<UIScope config={{ colorScheme: "dark" }}>
				<span>x</span>
			</UIScope>,
		)

		expect(document.documentElement.getAttribute("data-theme")).toBeNull()
	})
})
