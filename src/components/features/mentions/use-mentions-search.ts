/**
 * useMentionsSearch: the picker's suggestion state.
 *
 * Every kind is searched, not just the active tab, so tabs can show counts and the panel
 * can jump to the kind that matched; the jump stops once the writer picks a tab
 * (`manualKindOverride`). Lookup per kind: its `search`, then its static `suggestions`,
 * then the global `onResourceSearch`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { DEFAULT_DEBOUNCE_MS } from "@/hooks/use-debounce"

import type {
	Mention, MentionResource, MentionSuggestion, MentionsResourceSearch,
	MentionsSearchErrorHandler,
} from "./mentions.types"

/** Aborts are this hook's own doing and are never reported. */
function isAbortError(error: unknown) {
	return Boolean(error && (error as { name?: string }).name === "AbortError")
}

export interface UseMentionsSearchOptions<TResource extends string = string> {
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	onResourceSearch?: MentionsResourceSearch<TResource>
	initialMentions?: ReadonlyArray<Mention<TResource>>
	debounceMs?: number
	/** Receives every non-abort failure, with the kind that produced it. */
	onError?: MentionsSearchErrorHandler<TResource>
}

export interface UseMentionsSearchReturn<TResource extends string = string> {
	kinds: ReadonlyArray<TResource>
	activeKind: TResource | null
	setActiveKind: (kind: TResource | null) => void
	activeResource: MentionResource<TResource> | null

	query: string
	setQuery: (query: string) => void

	/** The active kind's rows. */
	suggestions: ReadonlyArray<MentionSuggestion<TResource>>
	/** Every kind's rows, for tab counts and cross-kind lists. */
	suggestionsByKind: Readonly<Record<string, ReadonlyArray<MentionSuggestion<TResource>>>>
	isLoading: boolean
	error: unknown | null
	isError: boolean
	/** Failures per kind; one kind failing still leaves the others' results usable. */
	errorsByKind: Readonly<Partial<Record<TResource, unknown>>>
	retry: () => void

	mentions: ReadonlyArray<Mention<TResource>>
	addMention: (mention: Mention<TResource>) => void
	removeMention: (id: string) => void
	/**
	 * Accepts a list or an updater. Prefer the updater when syncing against the body: the
	 * editor's input event fires in the same tick as an insertion, so a list computed from
	 * the render's `mentions` would drop the mention just added.
	 */
	setMentions: (
		next: ReadonlyArray<Mention<TResource>>
			| ((prev: ReadonlyArray<Mention<TResource>>) => ReadonlyArray<Mention<TResource>>),
	) => void
	reset: () => void

	selectSuggestion: (suggestion: MentionSuggestion<TResource>) => Mention<TResource>

	/** True once the writer has picked a tab. Suspends the auto-jump. */
	manualKindOverride: boolean
	setManualKindOverride: (override: boolean) => void
}

export function useMentionsSearch<TResource extends string = string>(
	options: UseMentionsSearchOptions<TResource> = {},
): UseMentionsSearchReturn<TResource> {
	const {
		resources,
		onResourceSearch,
		initialMentions,
		debounceMs = DEFAULT_DEBOUNCE_MS,
		onError,
	} = options

	/* Keyed off the kind names, not the registry object, which is usually rebuilt inline every render. */
	const kindsKey = JSON.stringify(Object.keys(resources ?? {}))
	const kinds = useMemo<ReadonlyArray<TResource>>(
		() => JSON.parse(kindsKey) as TResource[],
		[kindsKey],
	)

	const [chosenKind, setActiveKindState] = useState<TResource | null>(() => kinds[0] ?? null)

	/* Derived, so the active kind always exists: a chosen kind that disappeared falls back to the first. */
	const activeKind = chosenKind && kinds.includes(chosenKind) ? chosenKind : (kinds[0] ?? null)
	const [manualKindOverride, setManualKindOverride] = useState(false)
	const [query, setQueryState] = useState("")
	const [suggestionsByKind, setSuggestionsByKind] = useState<
		Record<string, ReadonlyArray<MentionSuggestion<TResource>>>
	>({})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<unknown | null>(null)
	const [errorsByKind, setErrorsByKind] = useState<Partial<Record<TResource, unknown>>>({})
	const [retryTick, setRetryTick] = useState(0)
	const [mentions, setMentionsState] = useState<Mention<TResource>[]>(
		() => (initialMentions ? [...initialMentions] : []),
	)

	/** Monotonic; only the newest search may write state. */
	const requestRef = useRef(0)
	const abortRef = useRef<AbortController | null>(null)

	/* Callbacks live in refs so inline identities do not restart the search effect. */
	const resourcesRef = useRef(resources)
	const onResourceSearchRef = useRef(onResourceSearch)
	const onErrorRef = useRef(onError)
	useEffect(() => {
		resourcesRef.current = resources
		onResourceSearchRef.current = onResourceSearch
		onErrorRef.current = onError
	})

	const activeResource = useMemo(
		() => (activeKind && resources ? (resources[activeKind] ?? null) : null),
		[activeKind, resources],
	)

	const searchOneKind = useCallback(
		async (
			kind: TResource,
			needle: string,
			signal: AbortSignal,
		): Promise<ReadonlyArray<MentionSuggestion<TResource>>> => {
			const config = resourcesRef.current?.[kind]

			if (config?.search) {
				const result = await config.search(needle, { kind, signal })
				return result.map((suggestion) => ({ ...suggestion, kind }))
			}

			if (config?.suggestions) {
				const all = config.suggestions
				const filtered =
					needle.trim().length === 0
						? all
						: all.filter((s) => s.label.toLowerCase().includes(needle.toLowerCase()))
				return filtered.map((suggestion) => ({ ...suggestion, kind }))
			}

			if (onResourceSearchRef.current) {
				const result = await onResourceSearchRef.current(needle, kind, { kind, signal })
				return result.map((suggestion) => ({ ...suggestion, kind }))
			}

			return []
		},
		[],
	)

	const runSearch = useDebouncedCallback(
		(
			searchKinds: ReadonlyArray<TResource>,
			nextQuery: string,
			requestId: number,
			signal: AbortSignal,
		) => {
			void (async () => {
				setIsLoading(true)
				try {
					/* Each kind is caught individually so one failing registry cannot discard the others' results. */
					const entries = await Promise.all(
						searchKinds.map(async (kind) => {
							try {
								return { kind, list: await searchOneKind(kind, nextQuery, signal), error: null }
							} catch (thrown) {
								return {
									kind,
									list: [] as ReadonlyArray<MentionSuggestion<TResource>>,
									error: thrown,
								}
							}
						}),
					)

					// Race guard: a superseded search writes nothing.
					if (requestId !== requestRef.current || signal.aborted) return

					const next: Record<string, ReadonlyArray<MentionSuggestion<TResource>>> = {}
					const nextErrors: Partial<Record<TResource, unknown>> = {}
					let firstError: unknown | null = null

					for (const entry of entries) {
						next[entry.kind] = entry.list
						if (entry.error !== null && !isAbortError(entry.error)) {
							nextErrors[entry.kind] = entry.error
							firstError ??= entry.error
							onErrorRef.current?.(entry.error, { query: nextQuery, kind: entry.kind })
						}
					}

					setSuggestionsByKind(next)
					setErrorsByKind(nextErrors)
					setError(firstError)
				} finally {
					if (requestId === requestRef.current && !signal.aborted) setIsLoading(false)
				}
			})()
		},
		debounceMs,
	)

	useEffect(() => {
		const controller = new AbortController()
		abortRef.current = controller

		const detach = () => {
			controller.abort()
			if (abortRef.current === controller) abortRef.current = null
		}

		if (kinds.length === 0) {
			// oxlint-disable-next-line react/set-state-in-effect -- clears the results of a search that has been superseded — the effect owns the request lifecycle including its abort
			setSuggestionsByKind({})
			setIsLoading(false)
			setError(null)
			setErrorsByKind({})
			return detach
		}

		const requestId = ++requestRef.current
		setError(null)
		setErrorsByKind({})
		runSearch(kinds, query, requestId, controller.signal)

		return () => {
			runSearch.cancel()
			detach()
		}
	}, [kinds, query, retryTick, runSearch])

	const retry = useCallback(() => setRetryTick((tick) => tick + 1), [])

	/** Auto-jump: when the active kind has nothing and another does, move to it (unless the writer picked a tab). */
	useEffect(() => {
		if (manualKindOverride || !activeKind) return
		if ((suggestionsByKind[activeKind]?.length ?? 0) > 0) return
		const first = kinds.find((kind) => (suggestionsByKind[kind]?.length ?? 0) > 0)
		// oxlint-disable-next-line react/set-state-in-effect -- a REMEMBERED correction, not a derivation: the jumped-to kind persists once both kinds have results, and deriving it would silently change which tab is shown
		if (first && first !== activeKind) setActiveKindState(first)
	}, [activeKind, kinds, manualKindOverride, suggestionsByKind])

	/**
	 * Does not set `manualKindOverride`: the trigger detector calls this too. Only the panel
	 * knows a click was the writer's choice, so it sets the flag.
	 */
	const setActiveKind = useCallback((kind: TResource | null) => setActiveKindState(kind), [])
	const setQuery = useCallback((next: string) => setQueryState(next), [])

	const addMention = useCallback((mention: Mention<TResource>) => {
		// A name written twice is one mention.
		setMentionsState((prev) => (prev.some((m) => m.id === mention.id) ? prev : [...prev, mention]))
	}, [])

	const removeMention = useCallback((id: string) => {
		setMentionsState((prev) => prev.filter((mention) => mention.id !== id))
	}, [])

	const setMentions = useCallback<UseMentionsSearchReturn<TResource>["setMentions"]>(
		(next) =>
			setMentionsState((prev) =>
				typeof next === "function" ? [...next(prev)] : [...next],
			),
		[],
	)

	const reset = useCallback(() => {
		abortRef.current?.abort()
		requestRef.current++
		setMentionsState([])
		setQueryState("")
		setManualKindOverride(false)
		setSuggestionsByKind({})
		setIsLoading(false)
		setError(null)
		setErrorsByKind({})
	}, [])

	const selectSuggestion = useCallback(
		(suggestion: MentionSuggestion<TResource>) => {
			const kind = (suggestion.kind ?? activeKind) as TResource
			const mention: Mention<TResource> = {
				// Namespaced, so two records with the same id in different kinds stay distinct.
				id: `${kind}:${suggestion.id}`,
				kind,
				label: suggestion.label,
				href: suggestion.href ?? resources?.[kind]?.buildHref?.(suggestion),
				data: suggestion.data,
			}
			addMention(mention)
			return mention
		},
		[activeKind, addMention, resources],
	)

	const suggestions = useMemo<ReadonlyArray<MentionSuggestion<TResource>>>(
		() => (activeKind ? (suggestionsByKind[activeKind] ?? []) : []),
		[activeKind, suggestionsByKind],
	)

	return {
		kinds,
		activeKind,
		setActiveKind,
		activeResource,
		query,
		setQuery,
		suggestions,
		suggestionsByKind,
		isLoading,
		error,
		isError: error !== null,
		errorsByKind,
		retry,
		mentions,
		addMention,
		removeMention,
		setMentions,
		reset,
		selectSuggestion,
		manualKindOverride,
		setManualKindOverride,
	}
}
