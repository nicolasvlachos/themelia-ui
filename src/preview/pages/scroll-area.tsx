import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ScrollAreaPage() {
	return (
		<ComponentPage
			title="Scroll area"
			summary="A bounded scroll region, plus the two small primitives that keep meaning available without showing it: BooleanIndicator and VisuallyHidden."
			importPath="@/components/base/display"
			exports={["ScrollArea", "BooleanIndicator", "VisuallyHidden"]}
		>
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
				<PropTable
					rows={[
						{ name: "ScrollArea", type: "component", description: "A scroll container with the kit's scrollbar treatment. Give it a max height; it does not impose one." },
						{ name: "BooleanIndicator value", type: "boolean", description: "A yes/no state as a dot and a word, so it does not rely on colour alone." },
						{ name: "BooleanIndicator strings.true / strings.false", type: "string", description: "The two words. 'Active'/'Paused' beats 'true'/'false'." },
						{ name: "VisuallyHidden", type: "component", description: "Present to assistive technology, absent on screen. Not display:none, which removes it from both." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
