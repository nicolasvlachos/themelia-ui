import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CommentsPage() {
	return (
		<ComponentPage>
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
				<PropTable owners={["Comments", "CommentsAttachmentsConfig"]} />
				<PropTable
					symbols={["useComments", "CommentItem", "CommentContent", "CommentAttachmentChip", "useAttachmentUpload"]}
				/>
			</Example>
		</ComponentPage>
	)
}
