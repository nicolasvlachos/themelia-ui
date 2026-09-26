import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CommentComposer } from "./comment-composer"
import { Comments } from "./comments"

const nativeShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal")
const nativeClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close")

beforeEach(() => {
	Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
		configurable: true,
		value(this: HTMLDialogElement) { this.open = true },
	})
	Object.defineProperty(HTMLDialogElement.prototype, "close", {
		configurable: true,
		value(this: HTMLDialogElement) { this.open = false },
	})
})

afterEach(() => {
	if (nativeShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", nativeShowModal)
	else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal")
	if (nativeClose) Object.defineProperty(HTMLDialogElement.prototype, "close", nativeClose)
	else Reflect.deleteProperty(HTMLDialogElement.prototype, "close")
})

describe("comment recovery and context isolation", () => {
	it("announces composer validation errors", () => {
		render(
			<CommentComposer
				context={{ id: "booking-1", type: "booking" }}
				onSubmit={vi.fn()}
			/>,
		)

		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))

		expect(screen.getByRole("alert")).toHaveTextContent("A comment cannot be empty.")
	})

	it("cancels edit identity when the record context changes", async () => {
		const comment = {
			id: "comment-1",
			content: "Original note",
			contentType: "text" as const,
			user: { id: "user-1", name: "Maria" },
		}
		const props = {
			comments: [comment],
			canModerate: true,
			onSubmit: vi.fn(),
			onUpdate: vi.fn(),
		}
		const { rerender } = render(
			<Comments context={{ id: "booking-1", type: "booking" }} {...props} />,
		)

		fireEvent.click(screen.getByRole("button", { name: "Comment actions" }))
		fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }))
		expect(screen.getByText("Editing comment")).toBeInTheDocument()

		rerender(<Comments context={{ id: "booking-2", type: "booking" }} {...props} />)

		expect(screen.queryByText("Editing comment")).not.toBeInTheDocument()
		fireEvent.input(screen.getByRole("textbox", { name: "Write a comment…" }), {
			target: { innerHTML: "New record note" },
		})
		// TipTap ingests the DOM mutation before the submit reads its document model.
		await waitFor(() => expect(screen.getByRole("button", { name: "Undo" })).toHaveAttribute("aria-disabled", "false"))
		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))

		await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(1))
		expect(props.onUpdate).not.toHaveBeenCalled()
		expect(props.onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ commentableId: "booking-2", content: "<p>New record note</p>" }),
			expect.any(Object),
		)
	})

	it("dismisses a pending delete when the record context changes", async () => {
		const comment = {
			id: "comment-1",
			content: "Original note",
			contentType: "text" as const,
			user: { id: "user-1", name: "Maria" },
		}
		const onDelete = vi.fn()
		const { rerender } = render(
			<Comments
				context={{ id: "booking-1", type: "booking" }}
				comments={[comment]}
				canModerate
				onDelete={onDelete}
			/>,
		)

		fireEvent.click(screen.getByRole("button", { name: "Comment actions" }))
		fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }))
		expect(screen.getByRole("alertdialog")).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Delete this comment?" })).toBeInTheDocument()

		rerender(
			<Comments
				context={{ id: "booking-2", type: "booking" }}
				comments={[]}
				canModerate
				onDelete={onDelete}
			/>,
		)

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
		expect(onDelete).not.toHaveBeenCalled()
	})
})
