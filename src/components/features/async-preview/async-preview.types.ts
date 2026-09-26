/**
 * AsyncPreview — a popover that fetches when it opens. The kit owns the popover, trigger,
 * states, abort, race handling and caching; the consumer owns the fetch, routing and record UI.
 */
import type { ReactElement, ReactNode } from "react"

import type { PopoverContentProps } from "@/components/base/popover"

import type { AsyncPreviewStrings } from "./async-preview.strings"

/** `idle` before the first open; `empty` when the fetch resolved to nothing. */
export type AsyncPreviewStatus = "idle" | "loading" | "success" | "error" | "empty"

/** Why a fetch ran. `prefetch` fires on pointer-enter and is not repeated by the open that follows. */
export type AsyncPreviewReason = "open" | "refresh" | "prefetch"

/**
 * `cache-first` serves a fresh cache entry without a request. `always` refetches on every
 * open — for a value that changes while the reader is on the page.
 */
export type AsyncPreviewCachePolicy = "cache-first" | "always"

/** `false`, or a label to show beside the spinner while a slow step runs. */
export type AsyncPreviewLoadingState = false | { label?: ReactNode }

export interface AsyncPreviewState<TData, TContext = unknown, TType extends string = string> {
	type: TType
	context: TContext
	data: TData | null
	error: unknown
	loading: AsyncPreviewLoadingState
	status: AsyncPreviewStatus
	/** Anything the fetcher reported alongside the data — a count, a permission. */
	meta: Record<string, unknown>
	open: boolean
	/** Whether what is shown came from the cache rather than this open. */
	cached: boolean
	refresh: () => void
	prefetch: () => void
	close: () => void
}

/** What `onShow` is given. */
export interface AsyncPreviewShowArgs<TContext, TType extends string> {
	type: TType
	context: TContext
	/** Aborted when the popover closes or a newer request starts. Pass it to fetch. */
	signal: AbortSignal
	reason: AsyncPreviewReason
	/** Whether a cache entry existed. A revalidating fetch can render through it. */
	cached: boolean
	/** Reports a slow step — "Decrypting…" — without resolving. */
	setLoading: (loading: AsyncPreviewLoadingState) => void
	/** Carries a count or a permission alongside the record. */
	setMeta: (meta: Record<string, unknown>) => void
}

interface AsyncPreviewCallbacks<TData, TContext, TType extends string> {
	onOpenChange?: (open: boolean, state: AsyncPreviewState<TData, TContext, TType>) => void
	onBeforeShow?: (state: AsyncPreviewState<TData, TContext, TType>) => void
	onData?: (data: TData, state: AsyncPreviewState<TData, TContext, TType>) => void
	onError?: (error: unknown, state: AsyncPreviewState<TData, TContext, TType>) => void
	onSettled?: (state: AsyncPreviewState<TData, TContext, TType>) => void
	onRefresh?: (state: AsyncPreviewState<TData, TContext, TType>) => void
}

export interface AsyncPreviewRootBaseProps<TData, TContext, TType extends string>
	extends AsyncPreviewCallbacks<TData, TContext, TType> {
	/**
	 * Names the kind of record. Passed back to `onShow`, so one fetcher can serve several types.
	 * Caching requires `cacheKey`.
	 */
	type: TType
	/** Whatever the fetcher needs — usually an id. Handed to `onShow` unchanged. */
	context: TContext
	/**
	 * The record identity and cache key: it enables the cache. Change it when the record
	 * changes; absent, nothing is cached, and each open fetches or consumes its hover prefetch.
	 */
	cacheKey?: string
	/**
	 * `cache-first` serves a fresh cache entry without a request. `always` refetches on every
	 * open — for a value that changes while the reader is on the page.
	 * @default "cache-first"
	 */
	cachePolicy?: AsyncPreviewCachePolicy
	/**
	 * How long a cache entry counts as fresh, in ms: five minutes. Entries are evicted on read;
	 * nothing wakes up on a timer.
	 * @default 300_000
	 */
	staleTime?: number
	open?: boolean
	defaultOpen?: boolean
	strings?: Partial<AsyncPreviewStrings>
	children?: ReactNode
}

/** A preview that fetches. */
export interface AsyncPreviewDynamicRootProps<TData, TContext, TType extends string>
	extends AsyncPreviewRootBaseProps<TData, TContext, TType> {
	/**
	 * The fetcher, run when the preview opens or the trigger prefetches it. Supply this or
	 * `data`, not both.
	 */
	onShow: (args: AsyncPreviewShowArgs<TContext, TType>) => Promise<TData | null | undefined>
	data?: never
}

/** A preview whose data is already in hand: same component and states, no request. */
export interface AsyncPreviewStaticRootProps<TData, TContext, TType extends string>
	extends AsyncPreviewRootBaseProps<TData, TContext, TType> {
	/**
	 * The static form, in place of `onShow`: same component, same states, no request, for a row
	 * that already loaded what the preview shows.
	 */
	data: TData | null
	onShow?: never
}

export type AsyncPreviewRootProps<TData, TContext = unknown, TType extends string = string> =
	| AsyncPreviewDynamicRootProps<TData, TContext, TType>
	| AsyncPreviewStaticRootProps<TData, TContext, TType>

export interface AsyncPreviewTriggerRenderProps<TData, TContext, TType extends string> {
	state: AsyncPreviewState<TData, TContext, TType>
}

export interface AsyncPreviewTriggerProps<TData, TContext, TType extends string> {
	/** The element the preview hangs off. */
	children?: ReactNode | ((props: AsyncPreviewTriggerRenderProps<TData, TContext, TType>) => ReactElement)
	/**
	 * Starts the fetch on pointer-enter, before the popover opens — once per record. Not on
	 * focus: prefetching for every trigger a keyboard user tabs past would fire a request per row.
	 */
	prefetchOnHover?: boolean
	className?: string
}

export interface AsyncPreviewContentProps {
	className?: string
	children?: ReactNode
	/** The popover's own vocabulary. Defaults to `"auto"` — a preview sizes to its record. */
	width?: PopoverContentProps["width"]
	side?: PopoverContentProps["side"]
	align?: PopoverContentProps["align"]
}

export interface AsyncPreviewStateProps<TData, TContext, TType extends string> {
	children: (state: AsyncPreviewState<TData, TContext, TType>) => ReactNode
}

export interface AsyncPreviewBodyProps<TData, TContext, TType extends string> {
	/** Runs only in the `success` state, with the data non-null — so `data.name` needs no guard. */
	children: (data: TData, state: AsyncPreviewState<TData, TContext, TType>) => ReactNode
}

/** The three placeholder slots. `children` may be a function of the state, e.g. to read the error. */
export interface AsyncPreviewSlotProps<
	TData = unknown,
	TContext = unknown,
	TType extends string = string,
> {
	className?: string
	/**
	 * Replaces the default. The function form is what an error slot wants — it is the only way
	 * to show the error.
	 */
	children?: ReactNode | ((state: AsyncPreviewState<TData, TContext, TType>) => ReactNode)
}

export type AsyncPreviewLoadingProps<
	TData = unknown, TContext = unknown, TType extends string = string,
> = AsyncPreviewSlotProps<TData, TContext, TType>

export type AsyncPreviewErrorProps<
	TData = unknown, TContext = unknown, TType extends string = string,
> = AsyncPreviewSlotProps<TData, TContext, TType>

export type AsyncPreviewEmptyProps<
	TData = unknown, TContext = unknown, TType extends string = string,
> = AsyncPreviewSlotProps<TData, TContext, TType>
