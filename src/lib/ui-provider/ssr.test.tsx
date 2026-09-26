import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { UIProvider } from "./provider"
import { UIRoot } from "./root"
import { UIScope } from "./ui-scope"

/**
 * Server rendering and hydration of the provider: nothing created outside render, so
 * server and client markup agree.
 */
describe("server rendering", () => {
	it("renders without a document", () => {
		const html = renderToString(
			<UIProvider config={{ colorScheme: "dark", density: "compact" }}>
				<span>content</span>
			</UIProvider>,
		)

		expect(html).toContain("content")
	})

	it("emits the scope's attributes into the server markup", () => {
		const html = renderToString(
			<UIScope config={{ density: "compact" }} transparent={false}>
				<span>x</span>
			</UIScope>,
		)

		/* If these only appeared after an effect, the first paint would be unscoped. */
		expect(html).toContain('data-density="compact"')
	})

	it("does not reach for the document on the server", () => {
		/* `documentTarget` is honoured in an effect, which never runs during SSR. */
		expect(() =>
			renderToString(
				<UIRoot config={{ colorScheme: "dark" }} documentTarget="documentElement">
					<span>x</span>
				</UIRoot>,
			),
		).not.toThrow()
	})

	it("hydrates the server markup without a mismatch", () => {
		/* Via `onRecoverableError`: React 19 does not report hydration mismatches to the console. */
		const tree = (
			<UIProvider config={{ colorScheme: "dark", density: "compact" }}>
				<span>content</span>
			</UIProvider>
		)

		const container = document.createElement("div")
		container.innerHTML = renderToString(tree)
		document.body.append(container)

		const recovered: string[] = []
		act(() => {
			hydrateRoot(container, tree, {
				onRecoverableError: (error) => recovered.push(String((error as Error).message)),
			})
		})

		expect(recovered).toEqual([])
	})

	it("keeps two roots isolated rather than sharing a store", () => {
		/* A module-scope store would be shared between roots, and between server requests. */
		const first = renderToString(
			<UIProvider config={{ density: "compact" }}>
				<UIScope transparent={false}>
					<span>a</span>
				</UIScope>
			</UIProvider>,
		)
		const second = renderToString(
			<UIProvider config={{ density: "comfortable" }}>
				<UIScope transparent={false}>
					<span>b</span>
				</UIScope>
			</UIProvider>,
		)

		expect(first).toContain('data-density="compact"')
		expect(second).toContain('data-density="comfortable"')
	})
})
