/**
 * Text — the design-system text primitive. Rich HTML lives in `typography/rich-text`, so
 * ordinary text never loads sanitisation code. Carries `data-typography="text"` as a hook.
 */
import * as React from "react"
import { forwardRef } from "react"
import type { ReactNode } from "react"

import type { TextSize } from "@/lib/ui-provider"

import {
	textVariants,
	type TextAlign,
	type TextLineHeight,
	type TextType,
	type TextWeight,
} from "./text.variants"

export type { TextAlign, TextLineHeight, TextType, TextWeight }

// Attributes common to every tag Text renders, plus `htmlFor` for `label`.
export interface TextProps
	extends Omit<React.HTMLAttributes<HTMLElement>, "children">,
		Pick<Partial<React.LabelHTMLAttributes<HTMLLabelElement>>, "htmlFor"> {
	/** Text as a plain string. Equivalent to passing it as `children`. */
	content?: string
	/**
	 * Semantic role, which selects the colour token. `main` for primary copy, `secondary`
	 * for supporting copy (descriptions, captions, metadata). `inherit` selects none and takes
	 * the parent's, for text inside a surface that already sets its own — a solid tab, a
	 * tooltip, a coloured chip. Without it those places would drop Text and hand-roll a span,
	 * which is how a kit ends up with two ways to set type.
	 */
	type?: TextType
	/**
	 * Step on the type scale. Omit it on primary content so the provider default flows;
	 * `UIProvider`'s `typography.defaultTextSize` changes it. Reserve `xs` for support text
	 * and metadata.
	 * @default "sm"
	 */
	size?: TextSize
	/** Horizontal alignment. */
	align?: TextAlign
	/**
	 * Leading. Unset, each size step carries the line box paired with it; a value here
	 * overrides that. `tight` and `none` suit dense rows and single-line values; `relaxed`
	 * suits prose.
	 * @default paired
	 */
	lineHeight?: TextLineHeight
	/** Tabular figures, so digits align in a column. Use for any value in a table. */
	numeric?: boolean
	/**
	 * Ellipsises the text at one line rather than wrapping. Makes the element a block with
	 * `min-width: 0`, for the same reason `align` does; every flex box between it and the
	 * constrained width also needs `min-width: 0` (`Stack` and `Grid` set it; a hand-rolled
	 * flex div does not). `Heading` and every `primitives` value take it too.
	 */
	truncate?: boolean
	/** Font weight. */
	weight?: TextWeight
	/** The monospaced face, for identifiers, codes and keys. */
	mono?: boolean
	/**
	 * The heading face (`--font-heading`), for a title that is not a document heading: a
	 * card's, a dialog's. A theme that sets a heading font reaches it here as in `Heading`.
	 */
	heading?: boolean
	/** Uppercase with open tracking, for an overline or a keyboard hint. */
	caps?: boolean
	/** Text content. Takes precedence over `content`. */
	children?: ReactNode
	/**
	 * Element to render: `span` inline, `p` for prose, `div` when it wraps blocks, `label`
	 * for a form label. For headings use `Heading`.
	 */
	tag?: "div" | "p" | "span" | "label"
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
	{
		content,
		type = "main",
		size: sizeProp,
		// No default: alignment inherits from the container.
		align,
		// No default: each size class carries its step's own leading; an explicit value wins.
		lineHeight,
		weight = "normal",
		className,
		children,
		numeric = false,
		truncate = false,
		mono = false,
		heading = false,
		caps = false,
		tag: Tag = "p",
		...props
	},
	ref,
) {
	const size = sizeProp ?? "default"
	const textClassNames = textVariants({ type, size, align, lineHeight, weight, numeric, truncate, mono, heading, caps, className })

	const body = children !== undefined && children !== null ? children : content

	// Renders nothing when empty. `dangerouslySetInnerHTML` counts as content (RichText uses it).
	const hasMarkup = (props as { dangerouslySetInnerHTML?: unknown }).dangerouslySetInnerHTML !== undefined
	if (!hasMarkup && (body === undefined || body === null || body === "")) return null

	return (
		<Tag ref={ref as never} className={textClassNames} data-typography="text" {...(props as object)}>
			{body}
		</Tag>
	)
})

Text.displayName = "Text"
