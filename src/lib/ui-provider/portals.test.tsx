import { render, screen } from "@testing-library/react"
import { createPortal } from "react-dom"
import { describe, expect, it } from "vitest"

import { Scope } from "./scope"
import { UIScope } from "./ui-scope"

/**
 * What a scope reaches: custom properties and `[data-density]` / `[data-theme]` inherit
 * down the DOM subtree, so neither follows a portal out of it. Pins the rule that
 * `UIPortalHost` works around (see portal-host.test.tsx).
 */
describe("scopes and portals", () => {
	it("a scope's attributes reach its own subtree", () => {
		render(
			<UIScope config={{ density: "compact" }} transparent={false}>
				<span data-testid="inside">x</span>
			</UIScope>,
		)

		expect(screen.getByTestId("inside").closest("[data-density]")).not.toBeNull()
	})

	it("a scope's attributes do NOT reach a portal outside it", () => {
		render(
			<UIScope config={{ density: "compact" }} transparent={false}>
				{createPortal(<span data-testid="portalled">x</span>, document.body)}
			</UIScope>,
		)

		/* A child of body, so no ancestor carries `data-density`. */
		expect(screen.getByTestId("portalled").closest("[data-density]")).toBeNull()
	})

	it("custom properties do not follow a portal either", () => {
		render(
			<Scope vars={{ "--density-scale": 0.8 }} transparent={false}>
				<span data-testid="inherits">x</span>
				{createPortal(<span data-testid="does-not">x</span>, document.body)}
			</Scope>,
		)

		const scoped = screen.getByTestId("inherits").closest("[data-ui-scope]")
		expect(scoped).not.toBeNull()
		expect(screen.getByTestId("does-not").closest("[data-ui-scope]")).toBeNull()
	})

	it("a portal target placed INSIDE the scope does inherit it", () => {
		/* The remedy: the DOM subtree matters, not the React tree. */
		function Portalled() {
			const host = document.createElement("div")
			return { host }
		}
		const { host } = Portalled()

		render(
			<UIScope config={{ density: "compact" }} transparent={false}>
				<div ref={(node) => node?.append(host)} />
				{createPortal(<span data-testid="into-scope">x</span>, host)}
			</UIScope>,
		)

		expect(screen.getByTestId("into-scope").closest("[data-density]")).not.toBeNull()
	})
})
