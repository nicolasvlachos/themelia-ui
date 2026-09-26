/**
 * RichText — the prose surface for content that did not come from JSX, in `Text`'s styles.
 *
 *   `html`      stored markup, always sanitised (no opt-out), set as innerHTML.
 *   `children`  nodes, for a caller that split the body itself (`features/mentions`), so
 *               prose marks are styled in one place.
 */
import { type ComponentProps, type ReactNode } from "react"

import { sanitizeHtml } from "@/lib/sanitize-html"
import { cx } from "@/lib/cx"

import { Text, type TextProps } from "../text"
import styles from "./rich-text.module.css"

export interface RichTextProps
	extends Omit<ComponentProps<"div">, "children" | "dangerouslySetInnerHTML" | "color"> {
	/** Sanitised through the kit's allow-list before it reaches the DOM. */
	html?: string | null
	/** Nodes instead of markup. Takes precedence over `html` when both are given. */
	children?: ReactNode
	size?: TextProps["size"]
	type?: TextProps["type"]
	align?: TextProps["align"]
	weight?: TextProps["weight"]
	/** Defaults to `relaxed`, the editor's prose leading, so a body does not reflow once posted. */
	lineHeight?: TextProps["lineHeight"]
	tag?: "div" | "p"
}

export function RichText({
	html,
	children,
	size,
	type,
	align,
	weight,
	lineHeight = "relaxed",
	tag = "div",
	className,
	...props
}: RichTextProps) {
	/* No `useMemo`: `sanitizeHtml` caches itself, and a hook would make this a client component. */
	const safe = children === undefined ? sanitizeHtml(html ?? "") : ""

	// Nothing survived the allow-list, or there was nothing to begin with.
	if (children === undefined && !safe) return null

	const shared = {
		tag,
		size,
		type,
		align,
		weight,
		lineHeight,
		"data-typography": "rich-text" as const,
		className: cx("rich-text--component", styles.root, className),
		...props,
	}

	if (children !== undefined) return <Text {...shared}>{children}</Text>

	return <Text {...shared} dangerouslySetInnerHTML={{ __html: safe }} />
}
