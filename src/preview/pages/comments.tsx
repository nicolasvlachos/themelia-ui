import { useCallback, useState } from "react"
import { CalendarIcon, LinkIcon, UserIcon } from "lucide-react"

import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	Comments,
	type CommentAttachment, type CommentData, type CommentUser,
} from "@/components/features/comments"
import type { MentionResource } from "@/components/features/mentions"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

type Kind = "user" | "booking"

const RESOURCES: Partial<Record<Kind, MentionResource<Kind>>> = {
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

const SEED: CommentData<CommentUser, unknown, Kind>[] = [
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

function SubmitRecoveryDemo() {
	const [comments, setComments] = useState<CommentData[]>([])
	const [failedOnce, setFailedOnce] = useState(false)

	return (
		<Comments
			bare
			title={false}
			context={{ id: "recovery", type: "booking" }}
			comments={comments}
			onSubmit={async (values, helpers) => {
				await new Promise((resolve) => setTimeout(resolve, 600))
				if (!failedOnce) {
					setFailedOnce(true)
					helpers.setErrors({ content: "The comment could not be saved. Try again." })
					return
				}
				setComments([{
					id: "recovered-comment",
					content: values.content,
					contentType: "html",
					createdAt: new Date().toISOString(),
					user: { id: "me", name: "You" },
				}])
				helpers.reset()
			}}
		/>
	)
}

export function CommentsPage() {
	const [comments, setComments] = useState([...SEED, ...CONVERSATION])
	const [log, setLog] = useState<string[]>([])

	const note = useCallback((line: string) => setLog((lines) => [line, ...lines].slice(0, 4)), [])

	return (
		<ComponentPage
			title="Comments"
			summary="A thread attached to any record. The composer, the timeline, and the states between them — replying, editing, submitting, failed. It owns none of the fetching: every control appears because there is a callback for it, so a button that does nothing cannot exist."
			importPath="@/components/features/comments"
			exports={["Comments", "CommentTimeline", "CommentComposer", "useComments",
				"CommentItem", "CommentContent", "CommentAttachmentChip", "useAttachmentUpload",
			]}
		>
			<Example
				id="comments"
				title="A thread"
				description="Each comment is a bubble with its author and time; reactions and Reply sit under it, and everything else is in the overflow menu beside it. Replies hang off a rail from the avatar they answer. A reply opens its composer under the thread, an edit replaces the comment in place, and long bodies, long threads and piles of files fold until asked for. Type @ or # in a composer to mention. Deleting asks first, because it takes the replies with it."
				stacked
				overflowing
				code={`<Comments
  context={{ id: "4417", type: "booking" }}
  comments={comments}
  canModerate
  resources={resources}
  onSubmit={async (values, helpers) => {
    await post(values)
    helpers.reset()
  }}
  onUpdate={update}
  onDelete={remove}
  onReact={react}
  reactionChoices={["👍", "❤️", "🎉", "😄", "👀", "🎯"]}
  commentActions={[
    { id: "copy-link", label: "Copy link", icon: LinkIcon, onClick: copyLink },
  ]}
  attachments={{ onUpload, maxSize: 5_000_000, maxFiles: 3 }}
/>`}
			>
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
			</Example>

			<Example
				id="comments-submit-recovery"
				title="Submit failure and retry"
				description="The first request fails after a visible pending state. The draft stays in place, the error is announced, and the same text can be submitted again without retyping."
				stacked
				code={`<Comments
  comments={comments}
  onSubmit={async (values, helpers) => {
    const result = await post(values)
    if (!result.ok) {
      helpers.setErrors({ content: result.message })
      return
    }
    helpers.reset()
  }}
/>`}
			>
				<SubmitRecoveryDemo />
			</Example>

			<Example
				id="comments-formats"
				title="Three stored formats"
				description="html is what this kit's editor writes — sanitised, with mentions swapped for live chips. text is a plain body from a form that predates rich text, with its line breaks kept. rich is a block document, the shape Editor.js and its imitators store: read-only here, because a thread migrated from another product has rows in it and rendering them as raw JSON is not an option."
				stacked
				code={`{ contentType: "html", content: "<p>…<span data-ref-id='user:1'>@Maria</span></p>" }
{ contentType: "text", content: "Two lines.\\nKept as written." }
{ contentType: "rich", content: JSON.stringify({ blocks: [...] }) }`}
			>
				<Comments<CommentUser, unknown, Kind>
					bare
					title={false}
					context={{ id: "demo", type: "format" }}
					// Flattened here: nesting the text one under the html one would hide it.
					comments={SEED.map(({ replyToId: _replyToId, ...comment }) => comment)}
					canComment={false}
					resources={RESOURCES}
					getStatusLabel={(status) => (status === "pending_review" ? "Pending review" : undefined)}
				/>
			</Example>

			<Example
				id="comments-empty"
				title="Empty, and read-only"
				description="canComment={false} removes the composer outright rather than disabling it — a control the viewer can never use is chrome. The empty state names the absence and says what would fill it."
				stacked
				code={`<Comments bare canComment={false} comments={[]} … />`}
			>
				<Comments
					bare
					title={false}
					context={{ id: "empty", type: "booking" }}
					comments={[]}
					canComment={false}
				/>
			</Example>

			<Example id="comments-rule" title="What a callback decides" stacked>
				<Callout label="Rule">
					A control appears because there is a <strong>callback</strong> for it, not
					because a flag says so. No <code>onDelete</code>, no delete button; no{" "}
					<code>onUpdate</code>, no edit. A permission flag that renders a button which
					then does nothing is worse than no button, and this way the two cannot drift
					apart. The flags that remain — <code>canComment</code>,{" "}
					<code>canModerate</code>, <code>allowReplies</code> — answer what a callback
					cannot: whether this viewer may act, and whether the thread has that shape at all.
				</Callout>
				<Text size="sm" type="secondary">
					Per-comment, <code>canDelete: false</code> refuses regardless of{" "}
					<code>canModerate</code>. Only <code>undefined</code> defers to the thread — so an
					audit note stays undeletable in a thread the viewer otherwise moderates.
				</Text>
			</Example>

			<Example id="comments-api" title="API">
				<PropTable owner="Comments"
					rows={[
						{ name: "context", type: "{ id, type, moduleKey? }", required: true, description: "What the thread hangs off. Passed straight through to onSubmit. Changing it clears the draft — a composer that stays mounted must not carry one record's text to the next." },
						{ name: "comments", type: "CommentData[]", required: true, description: "Flat, in display order. Replies nest by replyToId, so one posted an hour late still appears under its parent. A reply whose parent is not in the array is promoted rather than dropped." },
						{ name: "onSubmit / onUpdate", type: "(values, helpers) => void | Promise", description: "helpers.reset() is what clears the composer — a resolved promise is not proof of success, and a server answering validation with a 200 would otherwise throw away what the writer typed." },
						{ name: "onDelete / confirmDelete", type: "(id) => void / boolean", default: "confirmDelete: true", description: "The confirmation is opt-out because deleting takes the replies with it. Turn it off when the app already asks upstream." },
						{ name: "attachments", type: "{ onUpload, maxSize, maxFiles, accept }", description: "Without onUpload there is no attachment control. The uploader resolves to a CommentAttachment with a permanent url; the composer submits what it returns, not the file it was given." },
						{ name: "attachments.onReject", type: "(rejection) => void", description: "A refusal before any upload starts, as a code and the number behind it — never a sentence. The hook has no idea what language the reader speaks, and “too large” is useless without the limit." },
						{ name: "resources / onResourceSearch", type: "registry / (needle, kind) => Suggestion[]", description: "The mention registry. Without it the reference control does not appear. See the Mentions page." },
						{ name: "composerPosition", type: '"top" | "bottom"', default: '"top"', description: "A real per-thread decision: an activity log reads newest-first and a discussion reads like a chat, and the same page can want both. Replies and edits open inside the thread either way." },
						{ name: "commentActions", type: "ContextAction<CommentData>[] | (comment) => …", description: "Extra entries for each comment's overflow menu — copy a link, report, resolve. Bound to the comment like a table row's actions: visible and disabled may be predicates, and onClick receives the comment. They sit after pin and edit; a destructive entry still sorts last." },
						{ name: "maxVisibleReplies", type: "number", default: "3", description: "Replies an open thread shows; the earlier ones fold behind “Show N earlier replies”. The LAST ones are kept, so list replies oldest first. 0 shows them all." },
						{ name: "clampLines", type: "number", default: "6", description: "Lines of a long body before “See more”. Measured, so a short comment gets no control; 0 never clamps." },
						{ name: "maxVisibleAttachments", type: "number", default: "3", description: "Files shown before the rest fold behind “Show N more”. Folding one file saves nothing, so the fold starts at two hidden. 0 shows every file." },
						{ name: "reactionChoices", type: "readonly string[]", default: '["👍"]', description: "What “Add reaction” offers. One reacts at once; more open a picker that marks the reader's own. Every choice arrives through onReact." },
						{ name: "bare / title", type: "boolean / ReactNode | false", description: "bare drops the card chrome for a thread already inside a panel. title={false} hides the heading outright." },
						{ name: "renderItem / renderAttachment / renderReference", type: "(ctx) => ReactNode", description: "renderItem receives defaultItem, so a consumer can wrap the kit's comment rather than rebuild it." },
						{ name: "useComments", type: "(options) => state", description: "The state machine on its own — composerMode, submit, deleteComment, resetKey — for a fully custom thread. The mode is one union rather than three booleans, so “editing a reply while replying” cannot be represented." },
						{ name: "CommentItem", type: "component", description: "One comment and the controls that act on it: the author, time and message in a bubble, reactions and Reply under it, everything else in the overflow menu beside it. Its replies hang off a rail from its avatar, so who answered whom is a line to follow rather than an indent to infer." },
						{ name: "CommentContent", type: "component", description: "A comment\u2019s body in whichever format it was stored \u2014 three of them, because a comments table outlives any one editor and the rows written last year still have to render." },
						{ name: "CommentAttachmentChip", type: "component", description: "One file, in four states: staged, uploading, failed and posted. One row for all four, because a failed upload that looks different from a staged one is a row the reader has to learn twice." },
						{ name: "useAttachmentUpload", type: "hook", description: "The files staged on a draft and their uploads \u2014 the part with three things that are easy to get wrong: cancelling in flight, retrying one of several, and discarding a draft that still has uploads running." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
