import { render, screen } from "@testing-library/react"
import { fireEvent } from "@testing-library/dom"
import { describe, expect, it } from "vitest"

import { PreviewImage } from "./preview-image"

/** PreviewImage's failure path, and the reset on the next source. */
describe("PreviewImage", () => {
	it("shows the fallback once the source fails", () => {
		render(<PreviewImage src="/broken.png" alt="Cover" fallback={<span>no image</span>} />)

		fireEvent.error(screen.getByAltText("Cover"))
		expect(screen.getByText("no image")).toBeInTheDocument()
	})

	it("gives a new source a fresh attempt", () => {
		const { rerender } = render(
			<PreviewImage src="/broken.png" alt="Cover" fallback={<span>no image</span>} />,
		)
		fireEvent.error(screen.getByAltText("Cover"))
		expect(screen.getByText("no image")).toBeInTheDocument()

		/* Without the reset, one bad URL poisons the slot for every later source. */
		rerender(<PreviewImage src="/good.png" alt="Cover" fallback={<span>no image</span>} />)
		expect(screen.getByAltText("Cover")).toHaveAttribute("src", "/good.png")
		expect(screen.queryByText("no image")).not.toBeInTheDocument()
	})

	it("keeps showing the fallback while the source is unchanged", () => {
		const { rerender } = render(
			<PreviewImage src="/broken.png" alt="Cover" fallback={<span>no image</span>} />,
		)
		fireEvent.error(screen.getByAltText("Cover"))

		rerender(
			<PreviewImage src="/broken.png" alt="Cover" className="x" fallback={<span>no image</span>} />,
		)
		expect(screen.getByText("no image")).toBeInTheDocument()
	})
})
