import { Node } from "@tiptap/core"

/** Keep the same link protocols as stored rich text, including relative paths. */
function mentionHref(element: HTMLElement): string | null {
	const href = element.getAttribute("href")
	if (!href || href.trimStart().startsWith("//")) return null
	try {
		const { protocol } = new URL(href, "https://relative.invalid/")
		return ["http:", "https:", "mailto:", "tel:"].includes(protocol) ? href : null
	} catch {
		return null
	}
}

/** The stored mention HTML contract, kept local so editor and mentions stay independent. */
export const MentionNode = Node.create({
	name: "richTextMention",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			"data-ref-id": { default: null },
			"data-ref-kind": { default: null },
			"data-ref-tone": { default: null },
			href: { default: null, parseHTML: mentionHref },
			tag: {
				default: "span",
				parseHTML: (element: HTMLElement) => element.tagName.toLowerCase(),
				rendered: false,
			},
			label: {
				default: "",
				parseHTML: (element: HTMLElement) => element.textContent ?? "",
				rendered: false,
			},
		}
	},

	parseHTML() {
		return [
			{ tag: "span[data-ref-id]" },
			// Consume mention anchors before StarterKit's generic link mark.
			{ tag: "a[data-ref-id]", priority: 1001 },
		]
	},

	renderHTML({ node, HTMLAttributes }) {
		return [node.attrs.tag === "a" ? "a" : "span", { ...HTMLAttributes, contenteditable: "false" }, node.attrs.label]
	},

	renderText({ node }) {
		return node.attrs.label
	},
})
