/**
 * MentionChip: one inline reference. Not a Badge: it is a word in a sentence, inheriting
 * the line's size and baseline. Its twin is raw HTML inside the editor, so both share one
 * definition in `styles/mentions.css`, keyed off `data-ref-id`.
 *
 * Overrides, most specific first: `renderMention` on `MentionContent`,
 * `resources.<kind>.renderChip`, `resources.<kind>.tone`.
 */
import type { ComponentProps, MouseEventHandler, ReactNode } from "react"

import { cx } from "@/lib/cx"

import type { Mention, MentionResource } from "./mentions.types"

export interface MentionChipProps<TKind extends string = string, TData = unknown>
	// `resource` is a native span attribute (SGML) and means nothing here.
	extends Omit<ComponentProps<"span">, "children" | "onClick" | "resource"> {
	mention: Mention<TKind, TData>
	/** The registry entry for this mention's kind: icon, tone, renderer. */
	resource?: MentionResource<TKind, TData>
	/** Whether a mention with an `href` renders as a link. Off in a composer's draft list. */
	asLink?: boolean
	onClick?: MouseEventHandler<HTMLElement>
	/** Trailing slot, e.g. a remove control when the chip is listed rather than read. */
	trailing?: ReactNode
}

export function MentionChip<TKind extends string = string, TData = unknown>({
	mention,
	resource,
	asLink = true,
	onClick,
	trailing,
	className,
	...props
}: MentionChipProps<TKind, TData>) {
	if (resource?.renderChip) return <>{resource.renderChip(mention)}</>

	const Icon = resource?.icon
	const tone = resource?.tone

	const content = (
		<>
			{!!Icon && <Icon />}
			{mention.label}
			{trailing}
		</>
	)

	/* Identity attributes go on whichever element renders: the stylesheet keys off them. */
	const identity = {
		"data-ref-id": mention.id,
		"data-ref-kind": mention.kind,
		"data-ref-tone": tone,
		className: cx("mention-chip--component", className),
	}

	if (asLink && mention.href) {
		return (
			<a
				{...identity}
				href={mention.href}
				// A reference points out of the document it is written in.
				target="_blank"
				rel="noreferrer noopener"
				onClick={onClick}
			>
				{content}
			</a>
		)
	}

	return (
		<span {...identity} onClick={onClick} {...props}>
			{content}
		</span>
	)
}
