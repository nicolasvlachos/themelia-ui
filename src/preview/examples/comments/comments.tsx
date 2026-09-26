import { LinkIcon } from "lucide-react"
import { useCallback, useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	Comments, type CommentAttachment, type CommentData, type CommentUser,
} from "themelia-ui/features/comments"

import { RESOURCES, SEED, type Kind } from "./data"

/**
 * A longer conversation for the main thread: a body past the clamp, more files than the
 * fold shows, more replies than an open thread shows, and one reply answered in turn.
 * Replies are listed oldest first, so the latest are the ones an open thread keeps.
 */
const CONVERSATION: CommentData<CommentUser, unknown, Kind>[] = [
	{
		id: "c4",
		contentType: "text",
		content: [
			"Run-of-show for Marlow Hall, so everyone is working from the same page:",
			"Doors at 18:00, welcome drinks on the terrace until 18:45. Dinner service starts at 19:00 sharp — the kitchen needs the final numbers by Wednesday noon or they plate for the contracted 120.",
			"Speeches at 20:30, then the band until 23:30. The venue's hard curfew is midnight and the late-bar extension is not in the contract, so please do not promise it to the client.",
			"Load-in for the band is through the service entrance from 15:00. Parking on site is limited to six vehicles; everyone else uses the public car park on Mill Lane.",
			"Suppliers: florist sets up from 14:00, the cake arrives at 16:30 and goes straight to the cold room, and the photographer shoots the room before guests arrive.",
			"Open items: the signed rider, the final dietary list, and confirmation of the second photographer.",
		].join("\n"),
		createdAt: "2026-08-25T08:30:00Z",
		user: { id: "4", name: "Priya Raman" },
		reactions: [{ emoji: "🙌", count: 2, users: ["Marcus Webb", "Maria Petrova"] }],
		attachments: [
			{ id: "a4", name: "run-of-show-v3.pdf", size: 96_256, mimeType: "application/pdf", url: "#" },
			{ id: "a5", name: "floor-plan.png", size: 412_000, mimeType: "image/png", url: "#" },
			{ id: "a6", name: "supplier-contacts.pdf", size: 38_912, mimeType: "application/pdf", url: "#" },
			{ id: "a7", name: "parking-map.png", size: 221_184, mimeType: "image/png", url: "#" },
			{ id: "a8", name: "menu-final.pdf", size: 64_512, mimeType: "application/pdf", url: "#" },
		],
	},
	{
		id: "r1",
		contentType: "text",
		content: "Agreed on the timings. I'll hold the balance invoice until the rider is back.",
		createdAt: "2026-08-25T09:02:00Z",
		user: { id: "2", name: "Marcus Webb" },
		replyToId: "c4",
	},
	{
		id: "r2",
		contentType: "text",
		content: "The rider is with their legal team. They promised it by Thursday.",
		createdAt: "2026-08-25T09:40:00Z",
		user: { id: "1", name: "Maria Petrova" },
		replyToId: "c4",
	},
	{
		id: "r2a",
		contentType: "text",
		content: "Thursday works — forward it the moment it lands, please.",
		createdAt: "2026-08-25T10:05:00Z",
		user: { id: "4", name: "Priya Raman" },
		replyToId: "r2",
	},
	{
		id: "r3",
		contentType: "text",
		content: "I've moved the catering tasting to next Tuesday so it doesn't clash with load-in.",
		createdAt: "2026-08-25T11:15:00Z",
		user: { id: "3", name: "Alice Mercer" },
		replyToId: "c4",
	},
	{
		id: "r4",
		contentType: "text",
		content: "Second photographer confirmed. Contact details are in the supplier sheet.",
		createdAt: "2026-08-25T13:20:00Z",
		user: { id: "2", name: "Marcus Webb" },
		replyToId: "c4",
		reactions: [{ emoji: "🎉", count: 1, users: ["Priya Raman"] }],
	},
	{
		id: "r5",
		contentType: "text",
		content: "Signed rider received, attaching it here.",
		createdAt: "2026-08-25T15:48:00Z",
		user: { id: "1", name: "Maria Petrova" },
		replyToId: "c4",
		attachments: [
			{ id: "a9", name: "rider-signed.pdf", size: 152_064, mimeType: "application/pdf", url: "#" },
		],
	},
]

/** The picker's choices. A single entry would react at once, as the default does. */
const REACTION_CHOICES = ["👍", "❤️", "🎉", "😄", "👀", "🎯"]

const uploadAttempts = new WeakMap<File, number>()

/** A fake uploader, so failure and successful retry are both reachable. */
function fakeUpload(file: File, onProgress: (n: number) => void, signal: AbortSignal) {
	return new Promise<CommentAttachment>((resolve, reject) => {
		let progress = 0
		const tick = setInterval(() => {
			progress += 20
			onProgress(Math.min(progress, 100))
			if (progress >= 100) {
				clearInterval(tick)
				const attempt = (uploadAttempts.get(file) ?? 0) + 1
				uploadAttempts.set(file, attempt)
				// A file named "fail" fails once; Retry then demonstrates actual recovery.
				if (/fail/i.test(file.name) && attempt === 1) reject(new Error("The storage service refused it."))
				else resolve({ id: "", name: file.name, size: file.size, mimeType: file.type, url: "#" })
			}
		}, 250)
		signal.addEventListener("abort", () => {
			clearInterval(tick)
			reject(new DOMException("Aborted", "AbortError"))
		})
	})
}

export default function CommentsExample() {
	const [comments, setComments] = useState([...SEED, ...CONVERSATION])
	const [log, setLog] = useState<string[]>([])

	const note = useCallback((line: string) => setLog((lines) => [line, ...lines].slice(0, 4)), [])

	return (
		<>
			<Comments<CommentUser, unknown, Kind>
				context={{ id: "4417", type: "booking" }}
				comments={comments}
				canModerate
				resources={RESOURCES}
				attachments={{
					onUpload: ({ file, onProgress, signal }) => fakeUpload(file, onProgress, signal),
					maxSize: 5_000_000,
					maxFiles: 3,
					accept: "image/*,application/pdf",
				}}
				reactionChoices={REACTION_CHOICES}
				commentActions={[
					{
						id: "copy-link",
						label: "Copy link",
						icon: LinkIcon,
						onClick: (comment) => {
							const link = `${window.location.href.split("#")[0]}#/comments?comment=${comment.id}`
							void navigator.clipboard?.writeText(link).catch(() => undefined)
							note(`copied link to ${comment.id}`)
						},
					},
				]}
				onSubmit={(values, helpers) => {
					const posted: CommentData<CommentUser, unknown, Kind> = {
						id: `c${Date.now()}`,
						contentType: "html",
						content: values.content,
						createdAt: new Date().toISOString(),
						user: { id: "me", name: "You" },
						references: values.references,
						attachments: [...(values.attachments ?? [])],
						replyToId: values.replyToId,
					}
					// A new thread goes to the top; a reply joins the end of its conversation.
					setComments((prev) => (values.replyToId ? [...prev, posted] : [posted, ...prev]))
					note(values.replyToId ? "replied" : "posted")
					helpers.reset()
				}}
				onUpdate={(id, values, helpers) => {
					setComments((prev) =>
						prev.map((comment) =>
							comment.id === id
								? { ...comment, content: values.content, isEdited: true, references: values.references }
								: comment,
						),
					)
					note(`edited ${id}`)
					helpers.reset()
				}}
				onDelete={(id) => {
					setComments((prev) => prev.filter((comment) => comment.id !== id))
					note(`deleted ${id}`)
				}}
				onPinToggle={(comment) => {
					setComments((prev) =>
						prev.map((item) =>
							item.id === comment.id ? { ...item, isPinned: !item.isPinned } : item,
						),
					)
					note(`${comment.isPinned ? "unpinned" : "pinned"} ${comment.id}`)
				}}
				onReact={(id, emoji) => {
					setComments(prev => prev.map(comment => {
						if (comment.id !== id) return comment
						const current = comment.reactions?.find(reaction => reaction.emoji === emoji)
						const reactions = current
							? comment.reactions!.map(reaction => reaction.emoji === emoji
								? { ...reaction, mine: !reaction.mine, count: reaction.count + (reaction.mine ? -1 : 1) }
								: reaction).filter(reaction => reaction.count > 0)
							: [...(comment.reactions ?? []), { emoji, count: 1, mine: true }]
						return { ...comment, reactions }
					}))
					note(`reacted ${emoji} on ${id}`)
				}}
				getStatusLabel={(status) => (status === "pending_review" ? "Pending review" : undefined)}
			/>

			{log.length > 0 && (
				<Stack gap="none">
					{log.map((line, index) => (
						<Text key={`${line}-${index}`} size="xs" type="secondary">
							{line}
						</Text>
					))}
				</Stack>
			)}
		</>
	)
}
