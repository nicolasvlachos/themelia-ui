import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ContainersPage() {
	return (
		<ComponentPage>
			<Example
				example="containers/blocks"
				title="The four blocks"
				description="PageViewport owns page scroll and the page container query. Container owns the reading measure and the gutter. Section owns the rhythm between groups. TwoColumnLayout owns the main/aside grid. Nothing else in the kit claims any of those four jobs."
			/>

			<Example
				example="containers/two-column"
				title="TwoColumnLayout"
				description="The aside is second in the DOM at every width, so a reader tabbing through meets the primary content first. When the columns stack, the grid reorders them — the element never moves, which is what keeps that promise true. asidePosition moves the column, not the element, for the same reason."
			/>

			<Example id="containers-rule" title="One owner per job">
				<Callout label="Rule">
					Exactly one <code>PageViewport</code> per page, and it is the only thing that
					scrolls. A second scroll container inside it produces a page with two
					scrollbars, a sticky header that sticks to the wrong thing, and a{" "}
					<code>scroll-into-view</code> that lands in the wrong place — and by the time
					anyone notices, it is load-bearing.
				</Callout>
			</Example>

			<Example id="containers-api" title="API">
				<PropTable owners={["PageViewport", "Container", "Section", "TwoColumnLayout"]} />
			</Example>
		</ComponentPage>
	)
}
