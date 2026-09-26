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
				<PropTable owner="Text"
					rows={[
						{ name: "type", type: '"inherit" | "main" | "inverse" | "secondary" | "error" | "success" | "primary"', default: '"main"', description: "Semantic role, which selects the colour token. `inherit` selects none, for text inside a surface that already sets its own — a solid tab, a tooltip, a coloured chip. Without it those places would drop Text and hand-roll a span, which is how a kit ends up with two ways to set type." },
						{ name: "size", type: '"inherit" | "xxs" | "xs" | "pxs" | "sm" | "base" | "lg" | "xl"', default: "provider", description: "Step on the type scale. Omit on primary content. `xxs` renders as `xs`; use `xs`." },
						{ name: "weight", type: '"normal" | "medium" | "semibold" | "bold"', default: '"regular"', description: "Font weight." },
						{ name: "lineHeight", type: '"none" | "tight" | "snug" | "normal" | "relaxed" | "loose"', default: "paired", description: "Overrides the leading paired with the size step (--text-<step>--line-height)." },
						{ name: "numeric", type: "boolean", default: "false", description: "Tabular figures for values in a column." },
						{ name: "truncate", type: "boolean", default: "false", description: "Ellipsises at one line rather than wrapping. Makes the Text a block, for the same reason `align` does. The flex parent needs its own `min-width: 0`. `Heading` and every `primitives` value take it too." },
						{ name: "tag", type: '"p" | "div" | "span"', default: '"p"', description: "Element to render. Headings use Heading." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
