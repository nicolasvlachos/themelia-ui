import { AspectRatio } from "@/components/base/aspect-ratio"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AspectRatioPage() {
	return (
		<ComponentPage
			title="Aspect ratio"
			summary="A frame that keeps its proportion as its width changes — a cover image, a video, a map tile. Reach for it whenever media has to hold its shape before it loads, so the page does not jump when it arrives."
			importPath="@/components/base/aspect-ratio"
			exports={["AspectRatio"]}
		>
			<Example
				id="aspect-ratio"
				title="AspectRatio"
				description="The CSS property, given a name — and the rule that makes it useful: the direct child is stretched to fill and told to cover. Without that an image keeps its intrinsic size and simply overflows, which looks like the ratio doing nothing."
				stacked
				code={`<AspectRatio ratio={16 / 9}>
  <img src={cover} alt="" />
</AspectRatio>`}
			>
				<Stack direction="horizontal" gap="lg" style={{ width: "100%" }}>
					{[
						{ ratio: 16 / 9, label: "16 / 9" },
						{ ratio: 1, label: "1 / 1" },
						{ ratio: 3 / 4, label: "3 / 4" },
					].map((entry) => (
						<Stack key={entry.label} gap="2xs" style={{ flex: 1 }}>
							<AspectRatio ratio={entry.ratio}>
								<div style={{ display: "grid", placeItems: "center", background: "var(--muted-40)", borderRadius: "var(--radius)" }}>
									<Text size="xs" type="secondary">{entry.label}</Text>
								</div>
							</AspectRatio>
						</Stack>
					))}
				</Stack>
			</Example>

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
