/**
 * sanitizeHtml — an allow-list for stored HTML before it reaches the DOM: the marks a
 * rich-text editor produces, nothing that loads, executes or styles (`style` can overlay a
 * page and hijack clicks). Protocol-relative hrefs are dropped.
 *
 * `contenteditable` is allowed on mention tags only as `false` (keeps a chip atomic in an
 * editor, and can never enable editing). `class` is not allowed, so mention styling keys
 * off `data-ref-id`.
 */
import { fromHtml } from "hast-util-from-html"
import { sanitize, type Schema } from "hast-util-sanitize"
import { toHtml } from "hast-util-to-html"
import type { Root, RootContent } from "hast"

/** Inline marks, headings, lists, and the block wrappers an editor emits. */
const ALLOWED_TAGS = [
	"a", "b", "blockquote", "br", "code", "del", "div", "em",
	"h1", "h2", "h3", "h4", "h5", "h6", "i", "li", "mark", "ol", "p",
	"pre", "s", "span", "strong", "sub", "sup", "u", "ul",
] as const

const SCHEMA = {
	allowComments: false,
	allowDoctypes: false,
	tagNames: [...ALLOWED_TAGS],
	attributes: {
		/* `target` enumerated: an arbitrary value names, and can steer, a browsing context. */
		a: ["href", "title", ["target", "_blank", "_self", "_parent", "_top"], "rel",
			"dataRefId", "dataRefKind", "dataRefTone", ["contentEditable", "false"]],
		/* Mention identity survives, so a feature can swap a reference for a component. */
		span: ["dataRefId", "dataRefKind", "dataRefTone", ["contentEditable", "false"]],
	},
	/* No `javascript:` or `data:`. */
	protocols: { href: ["http", "https", "mailto", "tel"] },
	strip: ["embed", "iframe", "math", "noscript", "object", "script", "style", "svg", "template"],
} satisfies Schema

function dropProtocolRelativeLinks(node: Root | RootContent): void {
	if (node.type === "element") {
		const href = node.properties.href
		if (typeof href === "string" && href.trimStart().startsWith("//")) {
			delete node.properties.href
		}
	}
	if (node.type === "root" || node.type === "element") {
		for (const child of node.children) dropProtocolRelativeLinks(child)
	}
}

/*
 * Module-level cache, not a hook, so `RichText` stays usable in Server Components. Bounded
 * and cleared wholesale when full, so a feed of distinct documents cannot leak.
 */
const CACHE_LIMIT = 256
const cache = new Map<string, string>()

export function sanitizeHtml(input: string): string {
	if (!input) return ""

	const hit = cache.get(input)
	if (hit !== undefined) return hit

	const tree = fromHtml(input, { fragment: true })
	dropProtocolRelativeLinks(tree)
	const safe = toHtml(sanitize(tree, SCHEMA))

	if (cache.size >= CACHE_LIMIT) cache.clear()
	cache.set(input, safe)
	return safe
}
