/**
 * Moves a mention between a record and its HTML. The contract:
 *
 *   <span data-ref-id="user:17" data-ref-kind="user" data-ref-tone="info"
 *         contenteditable="false">@Maria Petrova</span>&nbsp;
 *
 * `data-ref-id` is the identity; `data-ref-tone` keeps the colour inside a contenteditable;
 * `contenteditable="false"` makes the chip atomic. All survive `sanitizeHtml` (a class
 * would not), which is why styling keys off `data-ref-id`.
 */
import type { Mention, MentionTone } from "./mentions.types"

/**
 * Which tag a mention may be. A regex is safe here: it only reads markup this file wrote,
 * and it must run without a DOM (SSR, tests, workers).
 */
const MENTION_TAG = "(?:span|a)"

/** Matches one mention element and captures its id and inner text. */
const MENTION_RE = new RegExp(
	`<(${MENTION_TAG})\\b[^>]*?data-ref-id\\s*=\\s*"([^"]+)"[^>]*?>([\\s\\S]*?)<\\/\\1>`,
	"gi",
)

const KIND_ATTR_RE = /data-ref-kind\s*=\s*"([^"]+)"/i

/** The trigger characters a stored label may begin with, stripped when parsing back. */
const TRIGGER_PREFIX_RE = /^[@#$&%!~]\s*/

function escapeText(value: unknown) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
}

function escapeAttribute(value: unknown) {
	return String(value ?? "").replace(/"/g, "&quot;")
}

/**
 * Serialises a mention into the span that goes into a body. The trailing `&nbsp;` gives
 * the caret somewhere to land after the chip.
 */
export function buildMentionHtml<TKind extends string = string>(
	mention: Mention<TKind>,
	options?: { triggerChar?: string; tone?: MentionTone },
): string {
	const id = escapeAttribute(mention.id)
	const kind = escapeAttribute(mention.kind)
	const tone = options?.tone ? ` data-ref-tone="${escapeAttribute(options.tone)}"` : ""
	// `@` for a person by convention; other kinds state their own or get none.
	const trigger = options?.triggerChar ?? (mention.kind === "user" ? "@" : "")

	return (
		`<span data-ref-id="${id}" data-ref-kind="${kind}"${tone} contenteditable="false">` +
		`${escapeText(trigger)}${escapeText(mention.label)}` +
		`</span>&nbsp;`
	)
}

/**
 * Reads the mentions back out of a body, e.g. so a composer's list shrinks when a chip is
 * deleted. First occurrence wins. Returns id, kind and label only; merge with known
 * mentions to keep `href` and `data`.
 */
export function parseMentionsFromHtml<TKind extends string = string>(
	html: string,
): Array<Mention<TKind>> {
	const out: Mention<TKind>[] = []
	if (!html) return out

	const seen = new Set<string>()
	MENTION_RE.lastIndex = 0

	let match: RegExpExecArray | null
	while ((match = MENTION_RE.exec(html)) !== null) {
		const [element, , id, inner] = match
		if (seen.has(id!)) continue
		seen.add(id!)

		// The kind attribute if it survived, else the half of the id before the colon.
		const kind = (element!.match(KIND_ATTR_RE)?.[1] ?? id!.split(":")[0] ?? "") as TKind
		const label = (inner ?? "")
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/g, " ")
			.replace(TRIGGER_PREFIX_RE, "")
			.trim()

		out.push({ id: id!, kind, label })
	}

	return out
}

export type MentionHtmlSegment =
	| { kind: "html"; value: string }
	| { kind: "mention"; refId: string; fallback: string }

/**
 * Splits a body into HTML runs and mention placeholders, so prose renders as innerHTML and
 * references as React chips. `fallback` is the stored element, rendered when the record
 * does not know the mention.
 */
export function splitHtmlByMentions(html: string): MentionHtmlSegment[] {
	if (!html) return []

	const segments: MentionHtmlSegment[] = []
	let lastIndex = 0
	MENTION_RE.lastIndex = 0

	let match: RegExpExecArray | null
	while ((match = MENTION_RE.exec(html)) !== null) {
		const [full, , refId] = match
		const before = html.slice(lastIndex, match.index)
		if (before.length > 0) segments.push({ kind: "html", value: before })
		segments.push({ kind: "mention", refId: refId!, fallback: full })
		lastIndex = match.index + full.length
	}

	const tail = html.slice(lastIndex)
	if (tail.length > 0) segments.push({ kind: "html", value: tail })

	return segments
}
