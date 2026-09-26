import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CommentItem } from "./comment-item"
import { CommentTimeline } from "./comment-timeline"

const comment = { id: "c1", user: { name: "Maria" }, content: "Hello", contentType: "text" }

describe("compact conversation controls", () => {
	it("keeps reply and reaction controls visible while moderation lives in a menu", async () => {
		const onReply = vi.fn(), onReact = vi.fn(), onEdit = vi.fn()
		render(<CommentItem comment={comment} canModerate onReply={onReply} onReact={onReact} onEdit={onEdit} />)
		fireEvent.click(screen.getByRole("button", { name: "Reply" }))
		fireEvent.click(screen.getByRole("button", { name: "Add reaction" }))
		expect(onReply).toHaveBeenCalledWith("c1")
		expect(onReact).toHaveBeenCalledWith("c1", "👍")
		expect(screen.queryByRole("menuitem")).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Comment actions" }))
		fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }))
		expect(onEdit).toHaveBeenCalledWith(comment)
	})
	it("honors permissions and gives read-only reactions a name and state", () => {
		render(<CommentItem comment={{ ...comment, canEdit: false, reactions: [{ emoji: "👍", count: 2, mine: true }] }} canModerate onEdit={vi.fn()} />)
		expect(screen.queryByRole("button", { name: "Comment actions" })).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: "👍 2" })).toBeDisabled()
		expect(screen.getByRole("button", { name: "👍 2" })).toHaveAttribute("aria-pressed", "true")
	})
	it("reveals replies to replies without dropping their content", () => {
		render(<CommentTimeline comments={[comment, { ...comment, id: "c2", content: "First reply", replyToId: "c1" }, { ...comment, id: "c3", content: "Nested reply", replyToId: "c2" }]} />)
		fireEvent.click(screen.getByRole("button", { name: "Show 1 reply" }))
		const reply = screen.getByText("First reply").closest("article")!
		fireEvent.click(within(reply).getByRole("button", { name: "Show 1 reply" }))
		expect(screen.getByText("Nested reply")).toBeVisible()
		expect(within(reply).getByRole("button", { name: "Hide replies" })).toHaveAttribute("aria-expanded", "true")
	})
})
