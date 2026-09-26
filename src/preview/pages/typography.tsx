import { Stack } from "@/components/base/structure"
import { DisplayLabel, Heading, Text, TextLink } from "@/components/base/typography"
import type { TextType } from "@/components/base/typography"

import { Example } from "../partials/example"
import { MEASURE } from "../partials/measures"
import styles from "../preview.module.css"
import { ComponentPage } from "../partials/component-page"
import { PropTable } from "../partials/prop-table"

const ROLES: TextType[] = ["main", "secondary", "error", "success", "primary"]

export function TypographyPage() {
	return (
		<ComponentPage
			title="Typography"
			summary="Text, Heading, DisplayLabel, and TextLink. Every library-owned string reaches the DOM through one of these, so a raw element never carries type styling."
			importPath="@/components/base/typography"
			exports={["Text", "Heading", "DisplayLabel", "TextLink"]}
		>
			<Example
				id="text-roles"
				title="Text roles"
				description="The role selects a colour token, never a raw colour. Two greys only: main for primary copy, secondary (--muted-foreground) for everything supporting it — descriptions, captions, metadata. inverse is the one that needs a surface to be seen at all — it is the role for text drawn ON `--foreground`, so it is shown on one."
				stacked
				code={`<Text type="secondary">Supporting copy</Text>`}
			>
				{ROLES.map((type) => (
					<Text key={type} type={type}>
						{type} — the role picks the token.
					</Text>
				))}
				{/* inverse on the page background is invisible, which is the whole point of it. */}
				<div className={styles.inverseSwatch}>
					<Text type="inverse">inverse — the role picks the token.</Text>
				</div>
			</Example>

			<Example
				id="size"
				title="Size"
				description="Omit size on primary content so the provider default stays authoritative. Reserve xs for metadata."
				stacked
				code={`<Text size="xs">Metadata</Text>`}
			>
				{(["xs", "pxs", "sm", "base", "lg", "xl"] as const).map((size) => (
					<Text key={size} size={size}>
						{size} — the quick brown fox jumps over the lazy dog
					</Text>
				))}
			</Example>

			<Example
				id="heading"
				title="Heading"
				description="level picks the element for the document outline; size picks the appearance. They are separate so an h2 in a card can look smaller than an h2 on a page."
				stacked
				code={`<Heading level={2} size="lg" subHeading="Supporting line">Title</Heading>`}
			>
				<Heading level={1}>Level 1, default size</Heading>
				<Heading level={2}>Level 2, default size</Heading>
				<Heading level={2} size="sm">Level 2 rendered small</Heading>
				<Heading level={3} subHeading="A supporting line under the heading.">
					With a subheading
				</Heading>
			</Example>

			<Example
				id="numeric"
				title="Numeric"
				description="Tabular figures so digits align down a column. Use it for any value in a table."
				stacked
				code={`<Text numeric>1,234,567.89</Text>`}
			>
				<Text numeric>1,234,567.89</Text>
				<Text numeric>9,876,543.21</Text>
			</Example>

			<Example
				id="alignment"
				title="Alignment"
				description="center and right make the Text a block, because text-align on an inline box aligns nothing — the box is already only as wide as its own text. left stays inline, so a Text inside a sentence keeps its line."
				stacked
				code={`<Text align="right" numeric>1,234.50</Text>`}
			>
				<div style={{ ...MEASURE.field, borderInline: "1px dashed var(--border)" }}>
					<Text align="left">left — the default</Text>
					<Text align="center">center</Text>
					<Text align="right" numeric>1,234.50</Text>
					<Text align="right" numeric>42.00</Text>
				</div>
			</Example>

			<Example
				id="truncate"
				title="Truncation"
				description="`truncate` ellipsises at one line instead of wrapping. It was the most-repeated declaration set in the kit — 27 families drew the same four lines by hand, and 48 of those applications sat on a typography component. Like `align`, it makes the Text a block, because `text-overflow` does nothing on an inline box: the box is only ever as wide as its own text, so it never overflows. It also sets `min-width: 0`, since a flex item's is `auto` and the box would otherwise just grow. Every intermediate flex box up to the constrained width needs the same — `Stack` and `Grid` set it on themselves, a hand-rolled flex div does not, and that is the usual reason a correct-looking `truncate` does nothing."
				stacked
				code={`{/* Stack sets min-width: 0 on itself, so a nested one can still shrink */}
<Stack gap="sm">
  <Text truncate>{veryLongName}</Text>
</Stack>`}
			>
				<Stack id="truncate-demo" gap="sm" style={{ ...MEASURE.field, borderInline: "1px dashed var(--border)" }}>
					<Text truncate>
						A file name long enough that it cannot fit the width the caller allotted it
					</Text>
					<Text tag="span" size="xs" type="secondary" truncate>
						key_live_9f2c4b1e77a0d3f8b6c5a41d0e73b28c9f4610d7a2b8e5c1904f6d3b7e28a05c
					</Text>
					<Text>
						Without it the same string wraps to as many lines as it needs, which is right
						for prose and wrong for a row that has to hold its height.
					</Text>
				</Stack>
			</Example>

			<Example
				id="displaylabel-and-textlink"
				title="DisplayLabel and TextLink"
				description="DisplayLabel identifies a read-only value and has one fixed style everywhere. TextLink takes a render prop so a router's link can be supplied without the library importing one."
				stacked
				code={`<TextLink render={<RouterLink to="/x" />}>Go</TextLink>`}
			>
				<DisplayLabel>Account status</DisplayLabel>
				<Text>
					Active since 2024. <TextLink href="#x">View history</TextLink>, or{" "}
					<TextLink href="#y" variant="subtle">read the docs</TextLink>.
				</Text>
			</Example>

			<Example
				id="text-api"
				title="Text API">
				<PropTable owner="Text"
					rows={[
						{ name: "type", type: '"inherit" | "main" | "inverse" | "secondary" | "error" | "success" | "primary"', default: '"main"', description: "Semantic role, which selects the colour token. `inherit` selects none, for text inside a surface that already sets its own — a solid tab, a tooltip, a coloured chip. Without it those places had to drop Text and hand-roll a span, which is how a kit ends up with two ways to set type." },
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
