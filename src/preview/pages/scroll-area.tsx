import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ScrollAreaPage() {
	return (
		<ComponentPage>
			<Example
				example="scroll-area/scroll-area"
				title="ScrollArea"
				description="A bounded scroll region with the kit's scrollbar treatment. It does not impose a height — a scroll container that decides how tall it is cannot be used inside a layout that has already decided. tabIndex is 0, because a region that scrolls and cannot be focused cannot be scrolled by keyboard at all."
			/>

			<Example
				example="scroll-area/boolean-indicator"
				title="BooleanIndicator"
				description="A yes/no state as a dot AND a word. The word is the point: a green dot and a grey dot are the same dot to a reader who cannot separate the two, and 'Active'/'Paused' says more than 'true'/'false' to everyone else."
			/>

			<Example
				example="scroll-area/visually-hidden"
				title="VisuallyHidden"
				description="Present to assistive technology, absent on screen. Not display:none, which removes it from both — the whole point is that it is still read. The sentence below carries a note only a screen reader gets."
			/>

			<Example id="scroll-area-api" title="API">
				<PropTable symbols={["ScrollArea", "VisuallyHidden"]} />
				<PropTable owners={["BooleanIndicator"]} />
			</Example>
		</ComponentPage>
	)
}
