import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { QRCode } from "./qr-code"

/** QRCode's empty and failure branches: a value going empty never leaves a stale symbol. */
describe("QRCode", () => {
	it("encodes a value into an inline symbol", async () => {
		render(<QRCode value="https://example.com" label="Example" />)

		const symbol = await screen.findByRole("img", { name: "Example" })
		expect(symbol.innerHTML).toContain("<svg")
	})

	it("renders nothing for an empty value with no empty state", () => {
		const { container } = render(<QRCode value="" />)
		expect(container.firstChild).toBeNull()
	})

	it("renders the empty state when one is given", () => {
		render(<QRCode value="" emptyState={<span>nothing to encode</span>} />)
		expect(screen.getByText("nothing to encode")).toBeInTheDocument()
	})

	it("drops a symbol the moment its value goes empty", async () => {
		// The render checks `isEmpty` before reading the symbol, so no effect-side reset is needed.
		const { rerender } = render(<QRCode value="https://example.com" label="Example" />)
		await screen.findByRole("img", { name: "Example" })

		rerender(<QRCode value="" emptyState={<span>nothing to encode</span>} />)
		expect(screen.queryByRole("img")).toBeNull()
		expect(screen.getByText("nothing to encode")).toBeInTheDocument()
	})

	it("shows the placeholder while a value is being encoded", () => {
		render(<QRCode value="https://example.com" placeholder="encoding…" />)
		/* Encoding is async, so the first commit has no symbol yet. */
		expect(screen.getByText("encoding…")).toBeInTheDocument()
	})

	it("recovers when a value comes back after being empty", async () => {
		const { rerender } = render(<QRCode value="https://example.com" label="Example" />)
		await screen.findByRole("img", { name: "Example" })

		rerender(<QRCode value="" emptyState={<span>empty</span>} />)
		rerender(<QRCode value="https://other.example" label="Other" />)

		await waitFor(() => expect(screen.getByRole("img", { name: "Other" })).toBeInTheDocument())
	})
})
