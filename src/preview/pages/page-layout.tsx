import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PageLayoutPage() {
	return (
		<ComponentPage>
			<Example
				example="page-layout/page-heading"
				title="PageHeading"
				description="The base block, and one component rather than loose slots because the ORDER is the convention: breadcrumbs, eyebrow, title with its badges, description, actions aligned to the title row. A screen whose actions sit above its title reads as a different product, and that is exactly what happens when every page assembles this by hand."
			/>

			<Example
				example="page-layout/page-heading-slots"
				title="The slots, and why titlePrefix is not leading"
				description="leading sits left of the whole column, so the description indents with it — right for a back control or an avatar. titlePrefix sits left of the title LINE and the description still starts at the title's edge, which is what a glyph belonging to the title needs. titleSuffix and afterDescription fill in the other two positions."
			/>

			<Example
				example="page-layout/page-header"
				title="PageHeader"
				description="PageHeading plus what a routed page needs: a back control, a title icon that may itself be a link, and badges as data. It composes the base rather than reimplementing the spacing, so a heading inside a card and a heading at the top of a route stay the same shape. The back control is a real link when it has an href — middle-clickable, and openable in a new tab — and a button only when it has nowhere to go."
			/>

			<Example
				example="page-layout/page-actions"
				title="PageActions"
				description="The same ActionDefinition array the kit's menus and toolbars take, plus the one decision a header has to make: how many are buttons and how many collapse. placement pins an entry to a side — inline keeps the primary action visible however narrow it gets, menu keeps a destructive one out of the button row however wide."
			/>

			<Example
				example="page-layout/page"
				title="Page"
				description="Container for the measure, PageHeader for the title block, a body beneath. It exists because that arrangement, rebuilt by hand on every screen, drifts — one gutters at md and the next at lg, one puts 32px under the heading and the next 24."
			/>

			<Example id="page-rule" title="A page does not scroll itself">
				<Callout label="Rule">
					<code>Page</code> owns the measure and the rhythm. It does <strong>not</strong> own
					the scroll — <code>PageViewport</code> does, once, around the whole shell. A page
					that scrolls inside a shell that also scrolls gives you two scrollbars, a sticky
					header stuck to the wrong thing, and a <code>scrollIntoView</code> that lands in
					the wrong place.
				</Callout>
			</Example>

			<Example id="page-api" title="API">
				<PropTable owners={["PageHeading", "PageHeader", "PageActions", "Page"]} />
			</Example>
		</ComponentPage>
	)
}
