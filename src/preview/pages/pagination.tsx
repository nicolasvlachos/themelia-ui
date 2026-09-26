import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PaginationPage() {
	return (
		<ComponentPage>
			<Example
				example="pagination/pagination"
				title="Pagination"
				description="A window around the current page with ellipses for the gaps, so the control stays the same width whether there are five pages or five thousand. First and last are always shown — losing them behind an ellipsis makes 'go to the end' impossible."
			/>

			<Example
				example="pagination/pagination-shapes"
				title="Arrows, and what they are made of"
				description="The arrows carry their words from sm up and fall back to chevrons below it, so the pager under a wide table reads as Previous / Next and the one on a phone still fits. numbers={false} leaves the pair on its own, for a cursor pager with no page count to show."
			/>

			<Example
				example="pagination/pagination-links"
				title="A pager is navigation"
				description="pageHref makes every control a link, so a server-rendered list gets real hrefs — openable in a new tab, and working with JavaScript off. renderLink renders those links through the router, and onPageChange still fires, so a client router intercepts without a second prop. A disabled arrow stays a button: there is no href for a page that does not exist."
			/>

			<Example id="pagination-api" title="API">
				<PropTable owner="Pagination" />
				<PropTable symbols={["paginationRange"]} />
			</Example>
		</ComponentPage>
	)
}
