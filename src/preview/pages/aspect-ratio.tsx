import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AspectRatioPage() {
	return (
		<ComponentPage>
			<Example
				example="aspect-ratio/aspect-ratio"
				title="AspectRatio"
				description="The CSS property, given a name — and the rule that makes it useful: the direct child is stretched to fill and told to cover. Without that an image keeps its intrinsic size and simply overflows, which looks like the ratio doing nothing."
			/>

			<Example id="aspect-ratio-api" title="API">
				<PropTable
					rows={[
						{ name: "AspectRatio ratio", type: "ResponsiveValue<number>", default: "1", description: "Width divided by height. 16 / 9, 1, 4 / 3." },
						{ name: "AspectRatio fit", type: '"cover" | "contain"', default: '"cover"', description: "How a media child fills the box: cover crops to fill it, contain fits the whole image inside and leaves the rest of the box empty." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
