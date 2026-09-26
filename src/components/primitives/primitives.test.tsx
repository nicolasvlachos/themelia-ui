import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Address, Coordinates, InlineList, Measure, Quantity, Range, Rating, Ratio } from "./index"

/** Value primitives: asserts each really delegates its locale rules to `Intl`. */
describe("Ratio and Rating", () => {
	it("reads a count against its total", () => {
		render(<Ratio value={3} total={10} />)
		expect(screen.getByText("3 of 10")).toBeInTheDocument()
	})

	it("drops to a fraction for a column", () => {
		render(<Ratio value={3} total={10} format="fraction" />)
		expect(screen.getByText("3/10")).toBeInTheDocument()
	})

	it("renders the value alone when there is no total", () => {
		render(<Ratio value={3} />)
		expect(screen.getByText("3")).toBeInTheDocument()
	})

	it("states the scale a rating is out of", () => {
		render(<Rating value={4.5} />)
		expect(screen.getByText("4.5 out of 5")).toBeInTheDocument()
	})

	it("does not pad a whole rating with a false decimal", () => {
		/* 4, not 4.0. */
		render(<Rating value={4} hideMax />)
		expect(screen.getByText("4")).toBeInTheDocument()
	})
})

describe("Quantity", () => {
	it("agrees the noun with the count", () => {
		const { rerender } = render(<Quantity value={1} unit={{ one: "item", other: "items" }} />)
		expect(screen.getByText("1 item")).toBeInTheDocument()

		rerender(<Quantity value={3} unit={{ one: "item", other: "items" }} />)
		expect(screen.getByText("3 items")).toBeInTheDocument()
	})

	it("uses the plural rule rather than a count test", () => {
		/* English `one` is exactly 1; 1.5 takes `other`. */
		render(<Quantity value={1.5} unit={{ one: "item", other: "items" }} />)
		expect(screen.getByText("1.5 items")).toBeInTheDocument()
	})

	it("shows a zero label when one is given", () => {
		render(<Quantity value={0} unit={{ one: "item", other: "items" }} zeroLabel="no items" />)
		expect(screen.getByText("no items")).toBeInTheDocument()
	})
})

describe("Measure", () => {
	it("places the unit where the locale puts it", () => {
		render(<Measure value={2.5} unit="kilogram" locale="en-GB" />)
		expect(screen.getByText("2.5 kg")).toBeInTheDocument()
	})

	it("renders the number when the unit is not one Intl knows", () => {
		/* A bad unit must not take the page down with it. */
		expect(() => render(<Measure value={2.5} unit="bananas" />)).not.toThrow()
		expect(screen.getByText("2.5")).toBeInTheDocument()
	})
})

describe("InlineList", () => {
	it("joins with the locale's conjunction, not a comma", () => {
		render(<InlineList items={["Alice", "Bob", "Carol"]} locale="en-GB" />)
		/* `.join(", ")` would produce "Alice, Bob, Carol". */
		expect(screen.getByText("Alice, Bob and Carol")).toBeInTheDocument()
	})

	it("offers the disjunction", () => {
		render(<InlineList items={["red", "green"]} join="or" locale="en-GB" />)
		expect(screen.getByText("red or green")).toBeInTheDocument()
	})

	it("keeps the conjunction in front of the overflow count", () => {
		render(<InlineList items={["a", "b", "c", "d"]} max={2} locale="en-GB" />)
		expect(screen.getByText("a, b and 2 more")).toBeInTheDocument()
	})
})

describe("Coordinates", () => {
	it("holds a decimal pair to a metre", () => {
		render(<Coordinates latitude={48.85837} longitude={2.29448} locale="en-GB" />)
		expect(screen.getByText("48.85837, 2.29448")).toBeInTheDocument()
	})

	it("keeps the hemisphere when it drops the sign", () => {
		render(<Coordinates latitude={-33.8688} longitude={151.2093} format="dms" locale="en-GB" />)
		/* A DMS value with no hemisphere is ambiguous, so the letter is not optional here. */
		expect(screen.getByText(/S.*E/)).toBeInTheDocument()
	})
})

describe("Range", () => {
	it("uses the locale's range dash rather than a hyphen", () => {
		render(<Range from={10} to={50} locale="en-GB" />)
		const el = screen.getByText(/10.*50/)
		expect(el.textContent).not.toContain("-")
	})

	it("collapses a range whose ends are equal", () => {
		render(<Range from={10} to={10} currency="GBP" locale="en-GB" />)
		expect(screen.getByText("£10.00")).toBeInTheDocument()
	})

	it("renders the end it has when only one is given", () => {
		render(<Range from={10} locale="en-GB" />)
		expect(screen.getByText("10")).toBeInTheDocument()
	})
})

describe("Address", () => {
	const PARTS = { line1: "1 High Street", city: "Oxford", postalCode: "OX1 1AA", country: "GB" }

	it("orders the lines for the country, not the reader's locale", () => {
		const { container } = render(<Address value={PARTS} />)
		const lines = [...container.querySelectorAll("address > *")].map((n) => n.textContent)
		/* Postcode last and alone; the country as a name. */
		expect(lines).toEqual(["1 High Street", "Oxford", "OX1 1AA", "United Kingdom"])
	})

	it("prints a country code as its name", () => {
		const { container } = render(<Address value={{ line1: "1 High Street", country: "DE" }} />)
		expect(container.textContent).toContain("Germany")
		expect(container.textContent).not.toContain("DE")
	})

	it("leaves a country that is already a name alone", () => {
		const { container } = render(<Address value={{ line1: "1 High Street", country: "Scotland" }} />)
		expect(container.textContent).toContain("Scotland")
	})

	it("puts the comma after the city on an American line, and only there", () => {
		const { container } = render(
			<Address value={{ city: "Mountain View", region: "CA", postalCode: "94043" }} countryCode="US" />,
		)
		expect(container.textContent).toContain("Mountain View, CA 94043")
	})

	it("keeps the right separator when a field on that line is missing", () => {
		/* The separator belongs to the field it follows, not the position it lands in. */
		const { container } = render(
			<Address value={{ region: "CA", postalCode: "94043" }} countryCode="US" />,
		)
		expect(container.textContent).toContain("CA 94043")
		expect(container.textContent).not.toContain("CA, 94043")
	})

	it("puts the postal code before the city where that is the convention", () => {
		const { container } = render(
			<Address value={{ line1: "Hauptstr. 1", city: "Berlin", postalCode: "10115" }} countryCode="DE" />,
		)
		const lines = [...container.querySelectorAll("address > *")].map((n) => n.textContent)
		expect(lines).toEqual(["Hauptstr. 1", "10115 Berlin"])
	})

	it("drops a missing field without leaving its line behind", () => {
		const { container } = render(<Address value={{ line1: "1 High Street", city: "Oxford" }} />)
		expect(container.querySelectorAll("address > *")).toHaveLength(2)
	})

	it("renders a real <address> element carrying the block class", () => {
		/* The class, not the computed style: Vitest does not load CSS modules. The italic reset is checked in the browser. */
		const { container } = render(<Address value={PARTS} />)
		const el = container.querySelector("address")!
		expect(el.className).toContain("address--component")
	})

	it("collapses to one line for a cell", () => {
		render(<Address value={PARTS} format="inline" />)
		expect(screen.getByText("1 High Street, Oxford, OX1 1AA, United Kingdom")).toBeInTheDocument()
	})
})
