import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SideNavPage() {
	return (
		<ComponentPage>
			<Example
				example="side-nav/side-nav"
				title="SideNav"
				description="The rail between the pages of one section, not the app's global sidebar. Entries are data, so the active state, the ARIA, and the router integration are decided once. The active entry is matched by longest prefix — an index entry otherwise lights up on every page beneath it."
			/>

			<Example
				example="side-nav/section-nav"
				title="SectionNav"
				description="The in-page table of contents. It tracks which heading is on screen, which is the whole reason it exists — a list of anchors is trivial, a list of anchors that knows where the reader is needs an observer and a rule for which heading counts when two are visible."
			/>

			<Example
				example="side-nav/settings-shell"
				title="The rail beside its content: AsideNavShell"
				description="A composition of TwoColumnLayout and SideNav rather than new layout, with the rail drawn on the start side. The aside is still second in the DOM, so the content is reached first — the position is a grid decision, never a DOM one."
			/>

			<Example id="settings-shell-rule" title="One component, named for its shape">
				<Callout label="Rule">
					A settings area is an <code>AsideNavShell</code>, and so is an account area or a
					docs tree. The arrangement — a captioned rail beside a column of cards — is not
					specific to settings, and a section that had to import something called
					“settings” would end up rebuilding it instead. There is no second name for it.
				</Callout>
			</Example>

			<Example
				example="side-nav/breadcrumb-progress"
				title="A wizard's position: BreadcrumbProgress"
				description="How far through a sequence the reader is, drawn by base's Stepper as a trail. Finished steps and the current one are reachable when onStepClick is given; steps ahead are not, because a wizard that lets you skip a step you have not filled in is not a wizard. Below lg the labels fold away and the markers carry the position alone — a screen reader still hears each step's name."
			/>

			<Example id="side-nav-api" title="SideNav and SectionNav API">
				<PropTable owners={["SideNav", "SectionNav"]} />
				<PropTable symbols={["CategoryNav", "BreadcrumbProgress"]} />
			</Example>

			<Example id="settings-shell-api" title="AsideNavShell API">
				<PropTable owner="AsideNavShell" />
			</Example>
		</ComponentPage>
	)
}
