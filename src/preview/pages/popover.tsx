import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PopoverPage() {
	return (
		<ComponentPage>
			<Example
				example="popover/popover"
				title="Anatomy"
				description="Trigger and content, with optional header, title, description and footer inside. The title and description are wired to the panel's accessible name and description, so a panel without them announces as an unnamed group."
			/>

			<Example
				example="popover/popover-placement"
				title="side, align and width"
				description="`side` and `align` place the panel against its trigger, and it flips when there is no room. `width=&quot;trigger&quot;` matches the control it opened from — what a select-like panel wants — and `auto` sizes to the content up to the space actually available."
			/>

			<Example
				example="popover/popover-anchor"
				title="PopoverAnchor"
				description="Separates what the panel points AT from what opens it. For a panel opened by a toolbar button but anchored to the selection it acts on, or opened by a row's menu and anchored to the row."
			/>

			<Example id="popover-rule" title="Panel, not dialog">
				<Callout label="Rule">
					A popover leaves the page live and focus untrapped. If the reader must answer before
					continuing, that is <code>base/dialog</code>. If the content is a name for a control,
					that is <code>base/tooltip</code>, which is faster and announces as a description.
					A popover is for content worth reading that the page can survive being read beside.
				</Callout>
			</Example>

			<Example id="popover-api" title="API">
				<PropTable
					owners={[
						"Popover",
						"PopoverTrigger",
						"PopoverAnchor",
						"PopoverContent",
						"PopoverHeader",
						"PopoverTitle",
						"PopoverDescription",
						"PopoverFooter",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
