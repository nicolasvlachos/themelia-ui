import { Comments } from "themelia-ui/features/comments"

export default function CommentsEmpty() {
	return (
		<Comments
			bare
			title={false}
			context={{ id: "empty", type: "booking" }}
			comments={[]}
			canComment={false}
		/>
	)
}
