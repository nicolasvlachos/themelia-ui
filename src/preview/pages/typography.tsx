import { Example } from "../partials/example"
import { ComponentPage } from "../partials/component-page"
import { PropTable } from "../partials/prop-table"

export function TypographyPage() {
	return (
		<ComponentPage>
			<Example
				example="typography/text-roles"
				title="Text roles"
				description="The role selects a colour token, never a raw colour. Two greys only: main for primary copy, secondary (--muted-foreground) for everything supporting it — descriptions, captions, metadata. inverse is the one that needs a surface to be seen at all — it is the role for text drawn ON `--foreground`, so it is shown on one."
			/>

			<Example
				example="typography/size"
				title="Size"
				description="Omit size on primary content so the provider default stays authoritative. Reserve xs for metadata."
			/>

			<Example
				example="typography/heading"
				title="Heading"
				description="level picks the element for the document outline; size picks the appearance. They are separate so an h2 in a card can look smaller than an h2 on a page."
			/>

			<Example
				example="typography/numeric"
				title="Numeric"
				description="Tabular figures so digits align down a column. Use it for any value in a table."
			/>

			<Example
				example="typography/alignment"
				title="Alignment"
				description="center and right make the Text a block, because text-align on an inline box aligns nothing — the box is already only as wide as its own text. left stays inline, so a Text inside a sentence keeps its line."
			/>

			<Example
				example="typography/truncate"
				title="Truncation"
				description="`truncate` ellipsises at one line instead of wrapping. It is a prop because truncation is the declaration set a kit repeats most — the same four lines drawn by hand in module after module, usually on a typography component. Like `align`, it makes the Text a block, because `text-overflow` does nothing on an inline box: the box is only ever as wide as its own text, so it never overflows. It also sets `min-width: 0`, since a flex item's is `auto` and the box would otherwise just grow. Every intermediate flex box up to the constrained width needs the same — `Stack` and `Grid` set it on themselves, a hand-rolled flex div does not, and that is the usual reason a correct-looking `truncate` does nothing."
			/>

			<Example
				example="typography/displaylabel-and-textlink"
				title="DisplayLabel and TextLink"
				description="DisplayLabel identifies a read-only value and has one fixed style everywhere. TextLink takes a render prop so a router's link can be supplied without the library importing one."
			/>

			<Example
				id="text-api"
				title="Text API">
				<PropTable owner="Text" />
			</Example>
		</ComponentPage>
	)
}
