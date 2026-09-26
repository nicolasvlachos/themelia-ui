import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UploadProgressList, type UploadItem } from "./upload-queue"

const handlers = { onCancel: vi.fn(), onRetry: vi.fn(), onRemove: vi.fn() }

describe("UploadProgressList", () => {
	it("offers cancel on a moving transfer and never remove", () => {
		render(<UploadProgressList {...handlers} items={[{ id: "1", name: "a.pdf", status: "uploading", progress: 40 }]} />)
		expect(screen.getByRole("button", { name: "Cancel a.pdf" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Remove a.pdf" })).toBeNull()
	})

	it("offers retry and remove on a failed row", () => {
		render(<UploadProgressList {...handlers} items={[{ id: "1", name: "a.pdf", status: "error" }]} />)
		expect(screen.getByRole("button", { name: "Retry a.pdf" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Remove a.pdf" })).toBeInTheDocument()
	})

	it("announces a transfer that ends, and stays quiet while it moves", () => {
		const at = (item: Partial<UploadItem>): UploadItem[] => [{ id: "1", name: "a.pdf", status: "queued", ...item }]
		const { rerender, container } = render(<UploadProgressList items={at({})} />)
		const status = container.querySelector("[aria-live=polite]")!
		expect(status).toHaveTextContent("")

		rerender(<UploadProgressList items={at({ status: "uploading", progress: 50 })} />)
		expect(status).toHaveTextContent("")

		rerender(<UploadProgressList items={at({ status: "error" })} />)
		expect(status).toHaveTextContent("a.pdf: Failed")
	})
})
