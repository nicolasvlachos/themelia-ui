import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function EmptyPage() {
	return (
		<ComponentPage>
			<Example
				example="empty/empty"
				title="Empty"
				description="Centred and measure-limited, because an empty state is the whole surface — left-aligned text across the full width reads as a broken layout rather than a message."
			/>

			<Example
				example="empty/empty-media"
				title="How the media is dressed"
				description="Four treatments of one slot. icon puts a glyph in a muted tile; icon-soft is the same tile, quieter, for a glyph that illustrates rather than reports; illustration drops the chrome entirely, because an illustration brings its own canvas and a tile around it is a frame around a frame."
			/>

			<Example
				example="empty/empty-illustrations"
				title="The illustration set"
				description="Five compositions built from the theme's own surface, fill, and line tokens — which is why they are divs rather than SVG files. An exported illustration is a picture of one theme; these follow a retheme and both modes without a second asset."
			/>

			<Example
				example="empty/empty-border"
				title="padding and border"
				description="Three paddings, because an empty state in a side panel is a paragraph in a narrow column and the same component on a page is the whole viewport. border draws the dashed outline — for a state standing in for a card body, where the dashed edge says “something goes here”, not merely for any region that happens to be bare."
			/>

			<Example id="empty-rule" title="Density and padding">
				<Callout label="Rule">
					<code>padding</code> does <strong>not</strong> read the provider&rsquo;s density.
					Density already reaches these tokens through <code>--density-scale</code>, so a
					compact scope shrinks every padding step on its own. Reading density here as
					well would apply it twice — the double-factor bug{" "}
					<code>verify factors</code> exists to catch.
				</Callout>
			</Example>
			<Example id="empty-api" title="API">
				<PropTable owner="Empty" />
				<PropTable
					symbols={[
						"StackedCardsIllustration",
						"DocumentStackIllustration",
						"InboxCleanIllustration",
						"SearchGlassIllustration",
						"UsersCircleIllustration",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
