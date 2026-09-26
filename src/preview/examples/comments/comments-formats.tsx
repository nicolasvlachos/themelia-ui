import { Comments, type CommentUser } from "themelia-ui/features/comments"

import { RESOURCES, SEED, type Kind } from "./data"

export default function CommentsFormats() {
	return (
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
	)
}
