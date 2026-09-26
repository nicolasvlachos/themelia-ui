import { BooleanIndicator, ScrollArea, VisuallyHidden } from "@/components/base/display"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

// A card's edge and inset, so the demo frames the region the way a real surface would.
const SCROLL_FRAME = {
	maxHeight: "9rem",
	border: "var(--border-width) solid var(--border)",
	borderRadius: "var(--radius)",
	padding: "var(--surface-y) var(--surface-x)",
} as const

export function ScrollAreaPage() {
	return (
		<ComponentPage
			title="Scroll area"
			summary="A bounded scroll region, plus the two small primitives that keep meaning available without showing it: BooleanIndicator and VisuallyHidden."
			importPath="@/components/base/display"
			exports={["ScrollArea", "BooleanIndicator", "VisuallyHidden"]}
		>
			<Example
				id="scroll-area"
				title="ScrollArea"
				description="A bounded scroll region with the kit's scrollbar treatment. It does not impose a height — a scroll container that decides how tall it is cannot be used inside a layout that has already decided. tabIndex is 0, because a region that scrolls and cannot be focused cannot be scrolled by keyboard at all."
				stacked
				code={`<ScrollArea style={{ maxHeight: "8rem" }}>…</ScrollArea>`}
			>
				<ScrollArea style={SCROLL_FRAME}>
					<Stack gap="xs">
						{Array.from({ length: 12 }, (_, index) => (
							<Text key={index} size="sm" type="secondary">
								Scrollable line {index + 1}
							</Text>
						))}
					</Stack>
				</ScrollArea>
			</Example>

			<Example
				id="boolean-indicator"
				title="BooleanIndicator"
				description="A yes/no state as a dot AND a word. The word is the point: a green dot and a grey dot are the same dot to a reader who cannot separate the two, and 'Active'/'Paused' says more than 'true'/'false' to everyone else."
				stacked
				code={`<BooleanIndicator value strings={{ true: "Active", false: "Paused" }} />`}
			>
				<Stack direction="horizontal" gap="xl">
					<BooleanIndicator value strings={{ true: "Active", false: "Paused" }} />
					<BooleanIndicator value={false} strings={{ true: "Active", false: "Paused" }} />
				</Stack>
			</Example>

			<Example
				id="visually-hidden"
				title="VisuallyHidden"
				description="Present to assistive technology, absent on screen. Not display:none, which removes it from both — the whole point is that it is still read. The sentence below carries a note only a screen reader gets."
				stacked
				code={`<Text>
  Saved
  <VisuallyHidden> at 09:32 by Jane McDonald</VisuallyHidden>
</Text>`}
			>
				<Text size="sm" type="secondary">
					This sentence has a hidden note for screen readers.
					<VisuallyHidden> Only assistive technology reads this.</VisuallyHidden>
				</Text>
			</Example>

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
