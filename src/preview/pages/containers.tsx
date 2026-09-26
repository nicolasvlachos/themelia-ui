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
				<PropTable
					rows={[
						{ name: "PageViewport", type: "component", description: "The single page-scroll owner and the page container-query root. tabIndex defaults to 0, or the region cannot be scrolled by keyboard." },
						{ name: "Container maxWidth", type: '"sm" | "md" | "lg" | "xl" | "2xl" | "full"', default: '"xl"', description: "The reading measure." },
						{ name: "Container gutter", type: '"none" | "sm" | "md" | "lg"', default: '"md"', description: "The inline gutter." },
						{ name: "Section", type: "component", description: "A real <section> with one rhythm token. It does not re-expose the spacing scale — a page whose sections each pick a gap has no rhythm." },
						{ name: "TwoColumnLayout main / aside", type: "ReactNode", description: "The two work regions. aside is always second in the DOM." },
						{ name: "TwoColumnLayout asidePosition", type: '"start" | "end"', default: '"end"', description: "Which column the aside occupies. Implemented with grid-column only, so DOM order is untouched." },
						{ name: "TwoColumnLayout header / footer", type: "ReactNode", description: "Span both columns, before and after." },
						{ name: "TwoColumnLayout stickyAside", type: "boolean", default: "false", description: "Opt-in, because an aside taller than the viewport must be able to scroll away." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
