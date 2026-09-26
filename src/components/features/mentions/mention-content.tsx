/** Renders live references inside the stored paragraph/list tree without splitting HTML tags. */
import { createElement, Fragment, useMemo, type ReactNode } from "react"

import { RichText, type RichTextProps } from "@/components/base/typography"
import { sanitizeHtml } from "@/lib/sanitize-html"

import { MentionChip } from "./mention-chip"
import { fromHtml } from "hast-util-from-html"
import type { RootContent } from "hast"
import type { Mention, MentionsConfig } from "./mentions.types"

export interface MentionContentProps<TResource extends string = string>
	extends Omit<RichTextProps, "html" | "children"> {
	html: string
	/** The mentions the record carries, resolved against the body by `data-ref-id`. */
	mentions?: ReadonlyArray<Mention<TResource>>
	resources?: MentionsConfig<TResource>["resources"]
	/** Takes over every chip. More specific than `resources.<kind>.renderChip`. */
	renderMention?: (mention: Mention<TResource>) => ReactNode
	/** Replaces the kit's allow-list. Sanitising cannot be turned off, only swapped. */
	sanitizer?: (html: string) => string
}

export function MentionContent<TResource extends string = string>({
	html,
	mentions,
	resources,
	renderMention,
	sanitizer,
	...props
}: MentionContentProps<TResource>) {
	const safe = useMemo(
		() => (sanitizer ? sanitizer(html ?? "") : sanitizeHtml(html ?? "")),
		[html, sanitizer],
	)

	const byId = useMemo(() => {
		const map = new Map<string, Mention<TResource>>()
		for (const mention of mentions ?? []) map.set(mention.id, mention)
		return map
	}, [mentions])

	const tree = useMemo(() => fromHtml(safe, { fragment: true }), [safe])

	if (!safe) return null

	function renderNode(node: RootContent, key: string): ReactNode {
		if (node.type === "text") return node.value
		if (node.type !== "element") return null
		const refId = node.properties.dataRefId
		const mention = typeof refId === "string" ? byId.get(refId) : undefined
		if (mention && (node.tagName === "span" || node.tagName === "a")) {
			return createElement(Fragment, { key },
				renderMention ? renderMention(mention) : <MentionChip mention={mention} resource={resources?.[mention.kind]} />)
		}
		const attributes: Record<string, unknown> = { key }
		for (const [name, value] of Object.entries(node.properties)) {
			// HAST stores data attributes in camel case; React needs their HTML spelling.
			const attribute = name.startsWith("data")
				? name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
				: name
			attributes[attribute] = Array.isArray(value) ? value.join(" ") : value
		}
		return createElement(node.tagName, attributes,
			...(node.children.length ? node.children.map((child, index) => renderNode(child, `${key}-${index}`)) : []))
	}

	return <RichText {...props}>{tree.children.map((node, index) => renderNode(node, String(index)))}</RichText>
}
