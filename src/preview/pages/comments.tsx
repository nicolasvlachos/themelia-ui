import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CommentsPage() {
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
				example="comments/comments"
				title="A thread"
				description="Each comment is a bubble with its author and time; reactions and Reply sit under it, and everything else is in the overflow menu beside it. Replies hang off a rail from the avatar they answer. A reply opens its composer under the thread, an edit replaces the comment in place, and long bodies, long threads and piles of files fold until asked for. Type @ or # in a composer to mention. Deleting asks first, because it takes the replies with it."
				overflowing
			/>

			<Example
				example="comments/comments-submit-recovery"
				title="Submit failure and retry"
				description="The first request fails after a visible pending state. The draft stays in place, the error is announced, and the same text can be submitted again without retyping."
			/>

			<Example
				example="comments/comments-formats"
				title="Three stored formats"
				description="html is what this kit's editor writes — sanitised, with mentions swapped for live chips. text is a plain body from a form that predates rich text, with its line breaks kept. rich is a block document, the shape Editor.js and its imitators store: read-only here, because a thread migrated from another product has rows in it and rendering them as raw JSON is not an option."
			/>

			<Example
				example="comments/comments-empty"
				title="Empty, and read-only"
				description="canComment={false} removes the composer outright rather than disabling it — a control the viewer can never use is chrome. The empty state names the absence and says what would fill it."
			/>

			<Example id="comments-rule" title="What a callback decides">
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
