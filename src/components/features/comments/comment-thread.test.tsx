import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CommentItem } from "./comment-item"
import { CommentTimeline } from "./comment-timeline"
import { Comments } from "./comments"
import type { CommentData } from "./comments.types"

const root: CommentData = { id: "c1", user: { name: "Maria" }, content: "Hello", contentType: "text" }

function reply(n: number, parent = "c1"): CommentData {
	return { id: `r${n}`, user: { name: `Writer ${n}` }, content: `Reply ${n}`, contentType: "text", replyToId: parent }
}

describe("thread structure", () => {
	it("is a list of articles, each named by its author", () => {
		render(<CommentTimeline comments={[root, { ...root, id: "c2", user: { name: "Marcus" } }]} />)
		const list = screen.getByRole("list")
		expect(within(list).getAllByRole("listitem")).toHaveLength(2)
		expect(screen.getByRole("article", { name: "Maria" })).toBeInTheDocument()
		expect(screen.getByRole("article", { name: "Marcus" })).toBeInTheDocument()
	})

	it("exposes the absolute moment behind the relative one", () => {
		render(<CommentItem comment={{ ...root, createdAt: "2026-08-27T09:12:00Z" }} />)
		const time = document.querySelector("time")!
		expect(time).toHaveAttribute("dateTime", "2026-08-27T09:12:00.000Z")
		expect(time.firstElementChild).toHaveAttribute("title")
		expect(time.firstElementChild!.getAttribute("title")).not.toContain("T09:12")
	})
})

describe("reply expander", () => {
	it("opens the latest replies first and folds the earlier ones behind a count", () => {
		render(<CommentTimeline comments={[root, reply(1), reply(2), reply(3), reply(4), reply(5)]} />)
		const toggle = screen.getByRole("button", { name: "Show 5 replies" })
		expect(toggle).toHaveAttribute("aria-expanded", "false")
		expect(toggle).not.toHaveAttribute("aria-controls")
		expect(screen.queryByText("Reply 5")).not.toBeInTheDocument()

		fireEvent.click(toggle)
		const hide = screen.getByRole("button", { name: "Hide replies" })
		expect(hide).toHaveAttribute("aria-expanded", "true")
		const replies = screen.getByRole("list", { name: "Replies to Maria" })
		expect(hide).toHaveAttribute("aria-controls", replies.id)
		expect(within(replies).getAllByRole("article").map((node) => node.textContent)).toEqual([
			expect.stringContaining("Reply 3"),
			expect.stringContaining("Reply 4"),
			expect.stringContaining("Reply 5"),
		])

		fireEvent.click(screen.getByRole("button", { name: "Show 2 earlier replies" }))
		expect(within(replies).getAllByRole("article")).toHaveLength(5)
		expect(screen.queryByRole("button", { name: /earlier/ })).not.toBeInTheDocument()

		// Closing the thread forgets the earlier ones, so it reopens on the latest again.
		fireEvent.click(hide)
		fireEvent.click(screen.getByRole("button", { name: "Show 5 replies" }))
		expect(screen.getByRole("button", { name: "Show 2 earlier replies" })).toBeInTheDocument()
	})

	it("shows every reply when the limit is 0", () => {
		render(<CommentTimeline maxVisibleReplies={0} comments={[root, reply(1), reply(2), reply(3), reply(4)]} />)
		fireEvent.click(screen.getByRole("button", { name: "Show 4 replies" }))
		expect(screen.getAllByRole("article")).toHaveLength(5)
		expect(screen.queryByRole("button", { name: /earlier/ })).not.toBeInTheDocument()
	})
})

describe("body clamp", () => {
	const scrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight")
	beforeEach(() => {
		// jsdom lays nothing out: a long body is 12 lines of 20px, a short one is 1.
		Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
			configurable: true,
			get(this: HTMLElement) {
				return (this.textContent?.length ?? 0) > 100 ? 240 : 20
			},
		})
		const original = window.getComputedStyle
		vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
			const style = original(element, pseudo)
			return new Proxy(style, {
				get(target, key) {
					if (key === "lineHeight") return "20px"
					const value = Reflect.get(target, key)
					return typeof value === "function" ? value.bind(target) : value
				},
			})
		})
	})
	afterEach(() => {
		vi.restoreAllMocks()
		if (scrollHeight) Object.defineProperty(HTMLElement.prototype, "scrollHeight", scrollHeight)
	})

	const long = { ...root, content: "A long body. ".repeat(20) }

	it("folds a long body behind See more and unfolds it in place", () => {
		render(<CommentItem comment={long} />)
		const more = screen.getByRole("button", { name: "See more" })
		const body = document.getElementById(more.getAttribute("aria-controls")!)!
		expect(more).toHaveAttribute("aria-expanded", "false")
		expect(body).toHaveAttribute("data-clamped")
		expect(body.style.maxHeight).toBe("6lh")

		fireEvent.click(more)
		expect(screen.getByRole("button", { name: "See less" })).toHaveAttribute("aria-expanded", "true")
		expect(body).not.toHaveAttribute("data-clamped")
		expect(body.style.maxHeight).toBe("")
	})

	it("offers nothing for a short body, or when clamping is off", () => {
		const { unmount } = render(<CommentItem comment={root} />)
		expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument()
		unmount()
		render(<CommentItem comment={long} clampLines={0} />)
		expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument()
	})

	it("does not fold a body only a line or two past the limit", () => {
		// 12 lines against a limit of 10: two lines is within the slack.
		render(<CommentItem comment={long} clampLines={10} />)
		expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument()
	})
})

describe("attachments fold", () => {
	const files = (count: number) =>
		Array.from({ length: count }, (_, index) => ({ id: `a${index}`, name: `file-${index}.pdf`, url: "#" }))

	it("shows the first few and folds the rest behind a count", () => {
		render(<CommentItem comment={{ ...root, attachments: files(5) }} />)
		expect(screen.getAllByText(/file-\d\.pdf/)).toHaveLength(3)
		const more = screen.getByRole("button", { name: "Show 2 more" })
		expect(more).toHaveAttribute("aria-expanded", "false")
		fireEvent.click(more)
		expect(screen.getAllByText(/file-\d\.pdf/)).toHaveLength(5)
		expect(screen.getByRole("button", { name: "Show fewer" })).toHaveAttribute("aria-expanded", "true")
	})

	it("never folds a single file away", () => {
		render(<CommentItem comment={{ ...root, attachments: files(4) }} />)
		expect(screen.getAllByText(/file-\d\.pdf/)).toHaveLength(4)
		expect(screen.queryByRole("button", { name: /more/ })).not.toBeInTheDocument()
	})
})

describe("overflow and reactions", () => {
	it("adds consumer actions to the overflow menu, bound to the comment", async () => {
		const copy = vi.fn()
		render(
			<CommentItem
				comment={root}
				canModerate
				onDelete={vi.fn()}
				commentActions={[
					{ id: "copy", label: "Copy link", onClick: copy },
					{ id: "report", label: "Report", visible: (comment) => comment.user?.name !== "Maria" },
				]}
			/>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Comment actions" }))
		const items = await screen.findAllByRole("menuitem")
		expect(items.map((item) => item.textContent)).toEqual(["Copy link", "Delete"])
		fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }))
		expect(copy).toHaveBeenCalledWith(root)
	})

	it("opens a picker when more than one reaction is offered", async () => {
		const onReact = vi.fn()
		render(
			<CommentItem
				comment={{ ...root, reactions: [{ emoji: "🎉", count: 1, mine: true }] }}
				onReact={onReact}
				reactionChoices={["👍", "🎉"]}
			/>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Add reaction" }))
		expect(onReact).not.toHaveBeenCalled()
		const picker = await screen.findByRole("dialog", { name: "Choose a reaction" })
		expect(within(picker).getByRole("button", { name: "🎉" })).toHaveAttribute("aria-pressed", "true")
		fireEvent.click(within(picker).getByRole("button", { name: "👍" }))
		expect(onReact).toHaveBeenCalledWith("c1", "👍")
		await waitFor(() => expect(screen.queryByRole("dialog", { name: "Choose a reaction" })).not.toBeInTheDocument())
	})
})

describe("composing inside the thread", () => {
	const nativeShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal")
	beforeEach(() => {
		Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
			configurable: true,
			value(this: HTMLDialogElement) { this.open = true },
		})
	})
	afterEach(() => {
		if (nativeShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", nativeShowModal)
		else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal")
	})

	const thread = [root, reply(1)]

	it("opens a reply under the comment it answers, beside the top composer, and hands focus back", async () => {
		render(<Comments context={{ id: "1", type: "booking" }} comments={thread} onSubmit={vi.fn()} />)
		const article = screen.getByRole("article", { name: "Maria" })
		const replyButton = within(article).getAllByRole("button", { name: "Reply" })[0]!
		fireEvent.click(replyButton)

		// The folded thread opened, so the answer is written with the conversation in view.
		expect(within(article).getByRole("button", { name: "Hide replies" })).toHaveAttribute("aria-expanded", "true")
		expect(within(article).getByText("Replying to Maria")).toBeInTheDocument()
		expect(within(article).getByRole("textbox", { name: "Write a reply…" })).toBeInTheDocument()
		expect(within(article).getByRole("button", { name: "Post reply" })).toBeInTheDocument()
		// The top composer is untouched: still a new thread, still one textbox of that name.
		expect(screen.getAllByRole("textbox", { name: "Write a comment…" })).toHaveLength(1)
		expect(screen.getByRole("button", { name: "Post comment" })).toBeInTheDocument()

		const cancel = within(article).getByRole("button", { name: "Cancel" })
		act(() => cancel.focus())
		fireEvent.click(cancel)
		expect(screen.queryByText("Replying to Maria")).not.toBeInTheDocument()
		await waitFor(() => expect(replyButton).toHaveFocus())
	})

	it("sends a reply with its parent, and a top-level post without one, while both are open", async () => {
		const onSubmit = vi.fn()
		render(<Comments context={{ id: "1", type: "booking" }} comments={thread} onSubmit={onSubmit} />)
		const article = screen.getByRole("article", { name: "Maria" })
		fireEvent.click(within(article).getAllByRole("button", { name: "Reply" })[0]!)

		fireEvent.input(screen.getByRole("textbox", { name: "Write a comment…" }), {
			target: { innerHTML: "A new thread" },
		})
		await waitFor(() => expect(screen.getAllByRole("button", { name: "Undo" })[0]).toHaveAttribute("aria-disabled", "false"))
		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
		expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty("replyToId", "c1")
		// Posting at the top leaves the reply draft where it was.
		expect(within(article).getByText("Replying to Maria")).toBeInTheDocument()
	})

	it("edits a comment in its own place", async () => {
		render(
			<Comments context={{ id: "1", type: "booking" }} comments={thread} canModerate onSubmit={vi.fn()} onUpdate={vi.fn()} />,
		)
		const article = screen.getByRole("article", { name: "Maria" })
		fireEvent.click(within(article).getAllByRole("button", { name: "Comment actions" })[0]!)
		fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }))
		expect(within(article).getByText("Editing comment")).toBeInTheDocument()
		expect(within(article).getByRole("textbox", { name: "Edit your comment…" })).toBeInTheDocument()
		expect(within(article).getByRole("button", { name: "Save changes" })).toBeInTheDocument()
		// The article is still named by its author while its body is an editor.
		expect(screen.getByRole("article", { name: "Maria" })).toBe(article)
	})
})
