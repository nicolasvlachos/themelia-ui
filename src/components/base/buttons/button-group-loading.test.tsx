import { readFileSync } from "node:fs"
import { render, screen } from "@testing-library/react"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { Button } from "./button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group"
import groupStyles from "./button-group.module.css"
import { LoaderButton } from "./loader-button"

// Vitest does not install module styles. Apply the real group stylesheet with its
// generated class names so these assertions exercise its selectors and cascade.
const style = document.createElement("style")
beforeAll(() => {
	const classes = groupStyles as Record<string, string>
	const groupCss = readFileSync("src/components/base/buttons/button-group.module.css", "utf8")
	style.textContent = '[data-slot="button"] { border-radius: 8px; }'
		+ groupCss.replace(/\.([a-zA-Z][\w-]*)/g, (selector, name: string) => classes[name] ? `.${classes[name]}` : selector)
	document.head.append(style)
})
afterAll(() => style.remove())

function segmentStyles(group: HTMLElement) {
	return [...group.querySelectorAll('[data-slot="button"], [data-slot="button-group-text"], [data-slot="button-group-separator"]')].map(element => {
		const css = getComputedStyle(element)
		return {
			radius: css.borderRadius,
			startStart: css.borderStartStartRadius,
			startEnd: css.borderStartEndRadius,
			endStart: css.borderEndStartRadius,
			endEnd: css.borderEndEndRadius,
			marginInlineStart: css.marginInlineStart,
			marginTop: css.marginTop,
		}
	})
}

describe("ButtonGroup with loading announcements", () => {
	it.each(["horizontal", "vertical"] as const)("preserves %s corners and seams with separators and labels", orientation => {
		render(<>
			<ButtonGroup orientation={orientation} aria-label="reference">
				<Button>First</Button><ButtonGroupSeparator /><Button>Middle</Button><ButtonGroupText>of</ButtonGroupText><Button>Last</Button>
			</ButtonGroup>
			<ButtonGroup orientation={orientation} aria-label="async">
				<LoaderButton>First</LoaderButton><ButtonGroupSeparator /><LoaderButton>Middle</LoaderButton><ButtonGroupText>of</ButtonGroupText><LoaderButton>Last</LoaderButton>
			</ButtonGroup>
		</>)
		expect(segmentStyles(screen.getByRole("group", { name: "async" }))).toEqual(segmentStyles(screen.getByRole("group", { name: "reference" })))
	})

	it("keeps all four corners when the loading button is the only segment", () => {
		render(<>
			<ButtonGroup aria-label="reference"><Button>Save</Button></ButtonGroup>
			<ButtonGroup aria-label="async"><LoaderButton>Save</LoaderButton></ButtonGroup>
		</>)
		expect(segmentStyles(screen.getByRole("group", { name: "async" }))).toEqual(segmentStyles(screen.getByRole("group", { name: "reference" })))
	})
})
