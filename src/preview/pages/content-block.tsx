import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ContentBlockPage() {
	return (
		<ComponentPage
			title="Content block & icon badge"
			summary="ContentBlock is a titled region that is NOT a Card — a labelled group inside one — and it owns the four surfaces a region can take. IconBadge is the kit's glyph-in-a-medallion, the mark that sits at the head of one. DateBlock has a page of its own."
			importPath="@/components/base/display"
			exports={["ContentBlock", "IconBadge", "PlaceholderPattern", "DirectionProvider", "Slot"
			]}
		>
			<Example
				example="content-block/content-block-surfaces"
				title="Four surfaces"
				description="What separates them is what the block sits ON. `plain` has no chrome at all — a heading and its content. `bordered` is a ruled region and the page shows through it. `muted` sinks into the page. `card` lifts off it. A region that needs a card says surface=&quot;card&quot; and keeps only its own rhythm, rather than writing a border, the surface radius and `--card` into its own module."
			/>

			<Example
				example="content-block/content-block-flush"
				title="flush"
				description="Drops the surface's inset and clips to its radius, for content that has to reach the border. A strip of hairline-divided cells or a group of ruled rows reads as one module only if the rules meet the edge; paid by the block, each rule would stop short and every band would float. The children pay the inset instead."
			/>

			<Example
				example="content-block/content-block-header"
				title="The header assembles itself"
				description="icon, title, titleSuffix and headerEnd each render only when supplied, and the header row appears only if at least one of them does. A block is therefore a bare surface, a titled region, or a titled region with a control — without a variant prop deciding which."
			/>

			<Example
				example="content-block/icon-badge"
				title="IconBadge"
				description="A glyph in a tinted medallion. The tone sets a PAIR — a low-alpha fill and a full-strength glyph — declared together in CSS rather than as two props, so a badge cannot end up with one tone's ground and another's ink. `solid` inverts the pair for the one badge that has to be found at a glance. One component, so no surface hand-draws its own medallion in ten lines or mints a size token that resolves to the badge's own."
			/>

			<Example
				example="content-block/placeholder-pattern"
				title="PlaceholderPattern"
				description="Diagonal hatching for a region with nothing in it yet — a chart slot before data, a layout being described rather than filled. It reads as deliberately empty, which a blank box does not: a blank box reads as broken."
			/>

			<Example
				example="content-block/direction-slot"
				title="DirectionProvider and Slot"
				description="Two utilities with no appearance of their own. DirectionProvider sets the reading direction for a subtree, so a right-to-left region can sit inside a left-to-right page and every logical property in the kit follows it. Slot is the merge helper behind `render`: it puts a component&rsquo;s props and ref onto the single element it is given, which is how a trigger becomes your own Button rather than one the module styles."
			/>

			<Example id="content-block-rule" title="Not a Card">
				<Callout label="Rule">
					A Card is a panel; a ContentBlock is a labelled group inside one. Using a Card for
					both is how a settings page ends up with cards nested three deep, each drawing its
					own border and shadow. When a region needs the card's ground without the card's
					header machinery, that is <code>surface=&quot;card&quot;</code>.
				</Callout>
			</Example>

			<Example id="content-block-api" title="API">
				<PropTable owner="ContentBlock"
					rows={[
						{ name: "surface", type: '"plain" | "bordered" | "muted" | "card"', default: '"plain"', description: "Outer chrome. What separates bordered from card is the ground: a bordered block is a ruled region and the page shows through it; a card block lifts off it." },
						{ name: "flush", type: "boolean", default: "false", description: "Drops the inset and clips to the radius, for content that runs to the edge. Only meaningful on a surface that has an inset to drop." },
						{ name: "title / description", type: "ReactNode", description: "Either one renders the header; neither, and the block is a bare surface. The description is its own row, so a long one wraps under the whole header." },
						{ name: "icon / titleSuffix / headerEnd", type: "ReactNode", description: "Leading glyph, content immediately after the title (a badge, a count), and controls at the end of the title line." },
						{ name: "--content-block-p / --content-block-gap", api: ["css:--content-block-p", "css:--content-block-gap"], type: "token", description: "Optional local inset override and the gap between children. By default, framed blocks follow --surface-x and --surface-y; --content-block-p overrides both axes when explicitly set." },
						{ name: "IconBadge icon", type: "ComponentType | ReactNode", description: "A component or a rendered node. A component is called with aria-hidden, because the badge is a mark beside a name that already says it." },
						{ name: "IconBadge tone / solid / shape", type: 'IconBadgeTone / boolean / "rounded" | "circle"', default: '"neutral" / false / "rounded"', description: "Tone sets fill and glyph together so the two cannot come from different tones. solid inverts the pair. Size comes from `--icon-badge-size`, so a caller needing a smaller mark re-points the token instead of redrawing the badge." },
						{ name: "PlaceholderPattern", type: "component", description: "Diagonal hatching for a region with nothing in it yet. It reads as deliberately empty; a blank box reads as broken." },
						{ name: "DirectionProvider direction", type: '"ltr" | "rtl"', default: '"ltr"', description: "The reading direction for a subtree. Every measurement in the kit is a logical property, so a region mirrors from this one prop." },
						{ name: "Slot", type: "component", description: "The merge helper behind `render`: props and ref onto the single element. Ported rather than depended on \u2014 it is one function, and a package for it is a package to keep." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
