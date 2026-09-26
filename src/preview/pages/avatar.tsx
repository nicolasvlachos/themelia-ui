import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AvatarPage() {
	return (
		<ComponentPage>
			<Example
				example="avatar/avatar"
				title="Avatar"
				description="The fallback is not a spinner or a blank disc — a missing photograph is the normal case, not a loading state, and initials identify the person while the image is absent."
			/>

			<Example
				example="avatar/stacked"
				title="StackedAvatars"
				description="An overlapping row capped at max, with the remainder as a count. The cap is a prop rather than a CSS truncation because the overflow number has to be correct, not merely hidden."
			/>

			<Example id="avatar-api" title="API">
				<PropTable owners={["Avatar", "AvatarImage", "StackedAvatars"]} />
				<PropTable symbols={["AvatarFallback", "AvatarBadge", "AvatarGroup", "AvatarGroupCount"]} />
			</Example>
		</ComponentPage>
	)
}
