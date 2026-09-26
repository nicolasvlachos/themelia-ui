// @vitest-environment jsdom
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Text } from "@/components/base/typography"

import { configToCssVars } from "./tokens"

/*
 * The default text size is a token, not a context read, so `Text` (and everything built on
 * it) needs no hook and can run in a React Server Component.
 */
describe("the default text size", () => {
	it("is written as a custom property by the provider", () => {
		const vars = configToCssVars({ typography: { defaultTextSize: "xs" } })
		expect(vars["--text-default"]).toBe("var(--text-xs)")
		expect(vars["--text-default--line-height"]).toBe("var(--text-xs--line-height)")
	})

	it("writes nothing for `inherit`, which means take the surrounding size", () => {
		const vars = configToCssVars({ typography: { defaultTextSize: "inherit" } })
		expect(vars["--text-default"]).toBeUndefined()
	})

	it("writes nothing when the consumer sets no default", () => {
		/* The stylesheet's own fallback is `--text-sm`; the provider need not say so. */
		expect(configToCssVars({})["--text-default"]).toBeUndefined()
		expect(configToCssVars({ typography: {} })["--text-default"]).toBeUndefined()
	})

	it("Text with no size takes the default class, not a fixed step", () => {
		const { container } = render(<Text>hello</Text>)
		const el = container.firstElementChild!
		expect(el.className).toMatch(/sizeDefault/)
		expect(el.className).not.toMatch(/sizeSm|sizeXs|sizeBase/)
	})

	it("Text with an explicit size still takes that step", () => {
		const { container } = render(<Text size="xl">hello</Text>)
		expect(container.firstElementChild!.className).toMatch(/sizeXl/)
	})

	it("size=\"inherit\" takes no size class at all", () => {
		/* Its own class, not a `.root` rule, which would silently turn "inherit" into the default. */
		const { container } = render(<Text size="inherit">hello</Text>)
		expect(container.firstElementChild!.className).not.toMatch(/size[A-Z]/)
	})

	it("renders without any React context, which is what makes it server-safe", () => {
		/* No provider above it; rendering must not depend on one. */
		expect(() => render(<Text>hello</Text>)).not.toThrow()
	})
})

describe("overlay backdrop blur", () => {
	it("writes a blur only when one is asked for", () => {
		expect(configToCssVars({})["--overlay-backdrop-filter"]).toBeUndefined()
		expect(configToCssVars({ overlay: { backdropBlur: 0 } })["--overlay-backdrop-filter"]).toBeUndefined()
		expect(configToCssVars({ overlay: { backdropBlur: 4 } })["--overlay-backdrop-filter"]).toBe("blur(4px)")
		expect(configToCssVars({ overlay: { backdropBlur: "0.5rem" } })["--overlay-backdrop-filter"]).toBe("blur(0.5rem)")
	})
})
