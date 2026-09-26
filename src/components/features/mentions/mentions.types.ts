/**
 * Mentions: inline references to domain records in rich text (`@person`, `#booking`),
 * with a trigger character per resource kind.
 *
 * A mention is stored twice: the body HTML holds its position, a parallel `Mention[]` its
 * identity. Rendering resolves one against the other, so a stale label in stored HTML is
 * replaced by the current one. Generic in the kind union: `Mention<"user" | "booking">`.
 */
import type { ComponentType, ReactNode } from "react"

import type { SemanticTone } from "@/lib/component-vocabulary"

/** A chip always carries meaning, so `neutral` is excluded. */
export type MentionTone = Exclude<SemanticTone, "neutral">

export interface Mention<TKind extends string = string, TData = unknown> {
	/** Stable identity, conventionally `"<kind>:<recordId>"`. */
	id: string
	/** Must match a key in the resource registry. */
	kind: TKind
	/** What the chip reads. */
	label: string
	/** A permalink. With one the chip becomes a link. */
	href?: string
	/** Whatever the consumer wants to carry: the record itself, analytics. */
	data?: TData
}

/** One row in the picker, returned by a kind's `search`. */
export interface MentionSuggestion<TKind extends string = string, TData = unknown> {
	id: string
	label: string
	/** Supporting copy under the label, e.g. to tell two people of one name apart. */
	description?: string
	avatar?: string
	icon?: ComponentType<{ className?: string }>
	href?: string
	data?: TData
	/** Set by the search, not by the caller: which kind this row came from. */
	kind?: TKind
}

export interface MentionSearchRequestContext<TKind extends string = string> {
	kind: TKind
	/** Aborted when the query moves on or the picker unmounts. Pass it to fetch. */
	signal?: AbortSignal
}

export interface MentionSearchErrorContext<TKind extends string = string> {
	query: string
	kind: TKind
}

export type MentionsSearchErrorHandler<TKind extends string = string> = (
	error: unknown,
	context: MentionSearchErrorContext<TKind>,
) => void

/** One resource kind the picker offers. */
export interface MentionResource<TKind extends string = string, TData = unknown> {
	icon?: ComponentType<{ className?: string }>
	/** Names the tab: "Person", "Booking". */
	label?: string
	/** The character that opens the picker inline. Optional: a kind without one is reached from the picker button. */
	trigger?: string
	/** Per-kind search. Wins over the global fallback. */
	search?: (
		query: string,
		context?: MentionSearchRequestContext<TKind>,
	) => Promise<MentionSuggestion<TKind, TData>[]> | MentionSuggestion<TKind, TData>[]
	/** A fixed catalogue, filtered by label. Used when `search` is absent. */
	suggestions?: ReadonlyArray<MentionSuggestion<TKind, TData>>
	/** Derives a permalink from a suggestion that did not carry one. */
	buildHref?: (suggestion: MentionSuggestion<TKind, TData>) => string | undefined
	/** Replaces the chip entirely for this kind. */
	renderChip?: (mention: Mention<TKind, TData>) => ReactNode
	tone?: MentionTone
}

/**
 * The fallback search, used when a kind registers neither `search` nor `suggestions`:
 * one endpoint that takes a kind, registered once.
 */
export type MentionsResourceSearch<TResource extends string = string> = (
	needle: string,
	kind: TResource,
	context?: MentionSearchRequestContext<TResource>,
) => Promise<ReadonlyArray<MentionSuggestion<TResource>>> | ReadonlyArray<MentionSuggestion<TResource>>

export interface MentionsConfig<TResource extends string = string> {
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	onResourceSearch?: MentionsResourceSearch<TResource>
}
