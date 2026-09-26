import { useState } from "react"

import { Comments, type CommentData } from "themelia-ui/features/comments"

export default function CommentsSubmitRecovery() {
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
