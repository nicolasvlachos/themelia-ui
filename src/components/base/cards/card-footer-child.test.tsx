import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Card } from "./card"
import { CardFooter } from "./partials"

describe("Card", () => {
	it("renders a CardFooter child as the card's footer, not inside its content", () => {
		const { container } = render(
			<Card title="Northwind Traders">
				<p>Body</p>
				<CardFooter>
					<a href="#invoice">View the invoice</a>
				</CardFooter>
			</Card>,
		)
		const card = container.querySelector('[data-slot="card"]')!
		const footer = container.querySelector("a")!.closest('[data-slot="card-footer"]')
		expect(footer?.parentElement).toBe(card)
		expect(card.lastElementChild).toBe(footer)
		expect(container.querySelector('[data-slot="card-content"]')).toHaveTextContent("Body")
	})

	it("renders no empty content region when the footer is the only child", () => {
		const { container } = render(
			<Card title="Northwind Traders">
				<CardFooter>Footer</CardFooter>
			</Card>,
		)
		expect(container.querySelector('[data-slot="card-content"]')).toBeNull()
	})
})

describe("Card title level and media", () => {
	it("renders the title as a heading when given a level, and a full-bleed media strip", () => {
		const { container } = render(
			<Card title="Billing" titleLevel={2} media={<span>Cover</span>}>
				<p>Body</p>
			</Card>,
		)
		const heading = container.querySelector("h2.card--title")
		expect(heading).toHaveTextContent("Billing")
		const card = container.querySelector('[data-slot="card"]')!
		expect(card.firstElementChild).toHaveClass("card--media")
	})
})
