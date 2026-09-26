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
				<PropTable
					rows={[
						{ name: "PageHeading title", type: "ReactNode", description: "A string is wrapped in a Heading at `level`; a node is rendered as given." },
						{ name: "PageHeading level", type: "1 | 2 | 3 | 4 | 5 | 6", default: "1", description: "The heading ELEMENT, for the document outline. Not the type size." },
						{ name: "PageHeading eyebrow", type: "ReactNode", description: "Above the title. A string becomes a DisplayLabel." },
						{ name: "PageHeading badge / badges", type: "PageHeadingBadge[]", description: "Data, not nodes — { label, tone } — so their colour comes from the kit's vocabulary." },
						{ name: "PageHeading leading", type: "ReactNode", description: "Left of the whole column. The description indents with it." },
						{ name: "PageHeading titlePrefix", type: "ReactNode", description: "Left of the title LINE, centred on it. The description still starts at the title's edge." },
						{ name: "PageHeading titleSuffix / afterDescription", type: "ReactNode", description: "After the badges on the title line, and directly under the description." },
						{ name: "PageHeading withSeparator", type: "boolean", default: "false", description: "A rule beneath the block." },
						{ name: "PageHeader backHref / onBack", type: "string / () => void", description: "Either one shows the back control. With an href it is a real link." },
						{ name: "PageHeader titleIcon", type: "ComponentType", description: "Decorative by default; titleIconHref or onTitleIconClick makes it a control with a name." },
						{ name: "PageHeader titleBadges", type: "PageHeadingBadge[]", description: "Passed through to the heading." },
						{ name: "PageHeader slots", type: "{ back, beforeTitle, afterDescription, actions }", description: "Replaces a structural region without forking the header." },
						{ name: "PageHeader renderLink", type: "LayoutLinkRenderer", description: "Routes the back control and the title icon. Without it they are plain anchors." },
						{ name: "PageActions actions", type: "PageAction[]", description: "ActionDefinition plus placement." },
						{ name: "PageActions display", type: '"inline" | "menu" | "auto"', default: '"auto"', description: "auto watches the viewport and collapses below breakpoint." },
						{ name: "PageActions maxInlineActions", type: "number", default: "3", description: "How many render as buttons before the rest overflow." },
						{ name: "PageActions breakpoint", type: "number", default: "1040", description: "The width at or below which auto collapses." },
						{ name: "Page header", type: "PageHeaderProps", description: "Omit for a page that supplies its own header." },
						{ name: "Page maxWidth / gutter", type: "ContainerMaxWidth / ContainerGutter", default: '"xl" / "md"', description: "Handed to the Container underneath." },
						{ name: "Page bodyProps", type: 'ComponentProps<"div">', description: "For a page that needs to address the body region directly." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
