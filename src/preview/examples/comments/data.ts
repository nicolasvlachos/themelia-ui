import { CalendarIcon, UserIcon } from "lucide-react"

import type { CommentData, CommentUser } from "themelia-ui/features/comments"
import type { MentionResource } from "themelia-ui/features/mentions"

export type Kind = "user" | "booking"

export const RESOURCES: Partial<Record<Kind, MentionResource<Kind>>> = {
	user: {
		label: "Person",
		trigger: "@",
		icon: UserIcon,
		tone: "info",
		suggestions: [
			{ id: "1", label: "Maria Petrova", description: "Operations" },
			{ id: "2", label: "Marcus Webb", description: "Finance" },
		],
	},
	booking: {
		label: "Booking",
		trigger: "#",
		icon: CalendarIcon,
		tone: "success",
		suggestions: [{ id: "4417", label: "Marlow Hall — 14 Aug", description: "Confirmed" }],
	},
}

export const SEED: CommentData<CommentUser, unknown, Kind>[] = [
	{
		id: "c1",
		contentType: "html",
		content: `<p>Deposit is still outstanding — <span data-ref-id="user:1" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria Petrova</span> can you chase it before Friday?</p>`,
		createdAt: "2026-08-27T09:12:00Z",
		user: { id: "2", name: "Marcus Webb" },
		isPinned: true,
		references: [{ id: "user:1", kind: "user", label: "Maria Petrova" }],
		reactions: [
			{ emoji: "👍", count: 3, mine: true, users: ["Maria Petrova", "Alice Mercer", "You"] },
			{ emoji: "🎯", count: 1 },
		],
		attachments: [
			{ id: "a1", name: "invoice-4417.pdf", size: 184_320, mimeType: "application/pdf", url: "#" },
		],
		tagsArray: ["billing"],
	},
	{
		id: "c2",
		contentType: "text",
		content: "Chased. They said the transfer goes out tomorrow morning.\nI'll confirm once it lands.",
		createdAt: "2026-08-27T14:40:00Z",
		user: { id: "1", name: "Maria Petrova" },
		replyToId: "c1",
		isEdited: true,
	},
	{
		id: "c3",
		contentType: "rich",
		content: JSON.stringify({
			blocks: [
				{ type: "paragraph", data: { text: "Blocked on two things:" } },
				{ type: "list", data: { style: "ordered", items: ["The deposit", "A signed rider"] } },
				{ type: "quote", data: { text: "Rider goes out with the confirmation.", caption: "Ops handbook" } },
			],
		}),
		createdAt: "2026-08-26T11:05:00Z",
		user: { id: "3", name: "Alice Mercer" },
		status: "pending_review",
	},
]
