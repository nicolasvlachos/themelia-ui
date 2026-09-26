import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ContentBlockPage() {
	return (
		<ComponentPage>
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
				description="Two utilities with no appearance of their own. DirectionProvider tells the menus and popovers in a subtree its reading direction, and `dir` on the region mirrors its layout, so a right-to-left region can sit inside a left-to-right page and every logical property in the kit follows it. Slot is the merge helper behind `render`: it puts a component&rsquo;s props and ref onto the single element it is given, which is how a trigger becomes your own Button rather than one the module styles."
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
				<PropTable owners={["ContentBlock", "IconBadge", "DirectionProvider"]} />
				<PropTable symbols={["PlaceholderPattern", "Slot"]} />
				<PropTable
					rows={[
						{ name: "--content-block-p / --content-block-gap", api: ["css:--content-block-p", "css:--content-block-gap"], type: "token", description: "Optional local inset override and the gap between children. By default, framed blocks follow --surface-x and --surface-y; --content-block-p overrides both axes when explicitly set." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
