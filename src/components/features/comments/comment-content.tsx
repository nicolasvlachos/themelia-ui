/**
 * CommentContent — one comment's body, in whichever format it was stored:
 * - `text`: plain, newlines preserved;
 * - `html`: the kit editor's output, sanitised, mentions rendered as chips;
 * - `rich`: an Editor.js-style block document, read-only. Supports paragraph, header, list,
 *   quote and delimiter; unknown blocks fall back to their text.
 */
import { Fragment, type ReactNode } from "react"

import { Heading, RichText, Text, type HeadingLevel } from "@/components/base/typography"
import { MentionContent } from "@/components/features/mentions"
import { cx } from "@/lib/cx"

import { defaultCommentsStrings, type CommentsStrings } from "./comments.strings"
import type { CommentData, CommentUser, CommentsConfig, CommentsSlots } from "./comments.types"
import styles from "./comments.module.css"

export interface CommentContentProps<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	comment: CommentData<TUser, TMeta, TResource>
	resources?: CommentsConfig<TUser, TMeta, TResource>["resources"]
	renderReference?: CommentsSlots<TUser, TMeta, TResource>["renderReference"]
	/** Replaces the kit's allow-list. There is no way to skip sanitising. */
	sanitizer?: (html: string) => string
	/** Overrides this component's own copy — the quote attribution, so far. */
	strings?: Partial<CommentsStrings>
	className?: string
}

/** Tags out. For a block format that stores markup where the kit wants text. */
function stripHtml(value: string): string {
	return value.replace(/<[^>]*>/g, "").trim()
}

/** Unwraps a JSON-encoded string (`"\"hello\""`). Objects and arrays are left alone. */
function decodeQuoted(value: string | null | undefined): string {
	if (typeof value !== "string") return ""
	const trimmed = value.trim()
	if (trimmed === "" || trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed

	try {
		const parsed = JSON.parse(trimmed)
		if (typeof parsed === "string") return parsed
	} catch {
		/* Not JSON. It is just text with a quote in it. */
	}

	if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1)
	return trimmed
}

interface RichBlock {
	id?: string
	type: string
	data?: Record<string, unknown>
}

function RichBlockContent({ block, copy }: { block: RichBlock; copy: CommentsStrings }) {
	const data = block.data ?? {}

	switch (block.type) {
		case "paragraph": {
			const html = String(data.text ?? "").trim()
			return html ? <RichText html={html} /> : null
		}

		case "header": {
			const text = stripHtml(String(data.text ?? ""))
			if (!text) return null
			// Clamped: a stored level of 0 or 9 is not a heading tag.
			const level = Math.min(Math.max(Number(data.level ?? 3), 1), 6) as HeadingLevel
			return <Heading level={level}>{text}</Heading>
		}

		case "list": {
			const items = (Array.isArray(data.items) ? data.items : [])
				.map((item) => stripHtml(String(item ?? "")))
				.filter((item) => item.length > 0)
			if (items.length === 0) return null

			const ordered = data.style === "ordered"
			const List = ordered ? "ol" : "ul"
			return (
				<List className={cx(styles.richList, ordered && styles.richListOrdered)}>
					{items.map((item, index) => (
						<li key={`${item}-${index}`}>
							<Text tag="span">{item}</Text>
						</li>
					))}
				</List>
			)
		}

		case "quote": {
			const html = String(data.text ?? "").trim()
			if (!html) return null
			const caption = stripHtml(String(data.caption ?? ""))
			return (
				<blockquote className={styles.richQuote}>
					<RichText html={html} type="secondary" />
					{caption.length > 0 && (
						<cite className={styles.richCite}>
							<Text tag="span" size="xs" type="secondary">
								{copy.formatQuoteAttribution(caption)}
							</Text>
						</cite>
					)}
				</blockquote>
			)
		}

		case "delimiter":
			return <div aria-hidden className={styles.richDelimiter} />

		default: {
			// Unknown block: show its text rather than nothing.
			const text = stripHtml(String(data.text ?? ""))
			return text ? <Text className={styles.plain}>{text}</Text> : null
		}
	}
}

function RichContent({ raw, copy }: { raw: string | null | undefined; copy: CommentsStrings }) {
	if (!raw) return null

	let blocks: RichBlock[]
	try {
		const parsed = JSON.parse(raw) as { blocks?: RichBlock[] }
		blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : []
	} catch {
		// Labelled `rich` but not parseable. Show it as text; do not show nothing.
		return <Text className={styles.plain}>{decodeQuoted(raw)}</Text>
	}

	if (blocks.length === 0) return null

	return (
		<div className={styles.richBlocks}>
			{blocks.map((block, index) => (
				<Fragment key={block.id ?? `${block.type}-${index}`}>
					<RichBlockContent block={block} copy={copy} />
				</Fragment>
			))}
		</div>
	)
}

export function CommentContent<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>({
	comment,
	resources,
	renderReference,
	sanitizer,
	strings,
	className,
}: CommentContentProps<TUser, TMeta, TResource>): ReactNode {
	const copy = { ...defaultCommentsStrings, ...strings }
	const hook = cx("comment-content--component", className)
	const contentType = comment.contentType ?? "text"

	if (contentType === "rich") {
		return (
			<div className={hook}>
				<RichContent raw={comment.content} copy={copy} />
			</div>
		)
	}

	if (contentType === "html") {
		return (
			<div className={hook}>
				<MentionContent<TResource>
					html={comment.content ?? ""}
					mentions={comment.references}
					resources={resources}
					renderMention={renderReference}
					sanitizer={sanitizer}
				/>
			</div>
		)
	}

	// Plain text; `.plain` preserves line breaks.
	return <Text className={cx(hook, styles.plain)}>{decodeQuoted(comment.content)}</Text>
}
