/**
 * Text — the design-system text primitive. Rich HTML lives in `typography/rich-text`, so
 * ordinary text never loads sanitisation code. Carries `data-typography="text"` as a hook.
 */
import * as React from "react"
import { forwardRef } from "react"
import type { ReactNode } from "react"

import type { TextSize } from "@/lib/ui-provider"
import { cvm } from "@/lib/cvm"

import styles from "./text.module.css"

const textVariants = cvm(styles.root, {
	variants: {
		type: {
			// No class, so the surrounding colour flows through (a tooltip, a coloured chip).
			inherit: undefined,
			main: styles.typeMain,
			inverse: styles.typeInverse,
			secondary: styles.typeSecondary,
			error: styles.typeError,
			success: styles.typeSuccess,
			primary: styles.typePrimary,
		},
		size: {
			// `inherit` maps to no class so the surrounding size flows through.
			inherit: undefined,
			/*
			 * Resolved in CSS from the provider's `--text-default`, not in JS, so Text stays
			 * usable in React Server Components and nested scopes cascade.
			 */
			default: styles.sizeDefault,
			xxs: styles.sizeXxs,
			xs: styles.sizeXs,
			pxs: styles.sizePxs,
			sm: styles.sizeSm,
			base: styles.sizeBase,
			lg: styles.sizeLg,
			xl: styles.sizeXl,
		},
		align: {
			left: styles.alignLeft,
			center: styles.alignCenter,
			right: styles.alignRight,
		},
		lineHeight: {
			none: styles.leadingNone,
			tight: styles.leadingTight,
			snug: styles.leadingSnug,
			normal: styles.leadingNormal,
			relaxed: styles.leadingRelaxed,
			loose: styles.leadingLoose,
		},
		weight: {
			normal: styles.weightNormal,
			regular: styles.weightNormal,
			medium: styles.weightMedium,
			semibold: styles.weightSemibold,
			bold: styles.weightBold,
		},
		numeric: {
			true: styles.numeric,
			false: undefined,
		},
		truncate: {
			true: styles.truncate,
			false: undefined,
		},
	},
})

export type TextType =
	| "inherit" | "main" | "inverse" | "secondary" | "error" | "success" | "primary"
export type TextAlign = "left" | "center" | "right"
export type TextLineHeight = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose"
export type TextWeight = "normal" | "regular" | "medium" | "semibold" | "bold"

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
	 * and metadata. `xxs` renders as `xs`; use `xs`.
	 * @default "sm"
	 */
	size?: TextSize
	/** Horizontal alignment. */
	align?: TextAlign
	/**
	 * Leading, on the shared tier. Unset, each size step carries the leading paired with it
	 * (`--text-<step>--line-height`); a value here overrides that. `tight` and `none` suit
	 * dense rows and single-line values; `relaxed` suits prose.
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
		weight = "regular",
		className,
		children,
		numeric = false,
		truncate = false,
		tag: Tag = "p",
		...props
	},
	ref,
) {
	const size = sizeProp ?? "default"
	const textClassNames = textVariants({ type, size, align, lineHeight, weight, numeric, truncate, className })

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
