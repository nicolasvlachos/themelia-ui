import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SkeletonPage() {
	return (
		<ComponentPage>
			<Example
				example="skeleton/skeleton"
				title="Skeleton"
				description="The primitive is a box you size yourself. Everything below is built from it."
			/>

			<Example
				example="skeleton/composed"
				title="Composed skeletons"
				description="Shaped like the thing that is coming. A generic grey rectangle tells the reader only that something is happening; a skeleton in the right geometry tells them what, and stops the page jumping when it resolves."
			/>

			<Example id="skeleton-rule" title="It is announced, not silent">
				<Callout label="Rule">
					Every composed skeleton takes a <code>label</code> and announces itself as busy.
					A screen reader on a page of unlabelled grey boxes is told nothing at all — the
					visual affordance is the one thing that does not reach them.
				</Callout>
			</Example>

			<Example id="skeleton-api" title="API">
				<PropTable owners={["TableSkeleton", "ContentSkeleton", "PageSkeleton"]} />
				<PropTable symbols={["Skeleton", "TwoColumnPageSkeleton"]} />
			</Example>
		</ComponentPage>
	)
}
