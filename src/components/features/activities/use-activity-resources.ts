/**
 * useActivityResources — the registry rows look their resources up in, by key.
 * Every mutation emits the whole registry through `onResourcesChange` for persistence.
 */
import { useCallback, useEffect, useRef, useState } from "react"

import type { ActivityResourceConfig, ActivityResourceRef } from "./activities.types"

export type ActivityResourceRegistry = Readonly<Record<string, ActivityResourceConfig>>

export interface UseActivityResourcesOptions {
	resources?: ActivityResourceRegistry
	onResourcesChange?: (registry: ActivityResourceRegistry) => void
}

export interface UseActivityResourcesReturn {
	registry: ActivityResourceRegistry
	get: (ref: ActivityResourceRef | string) => ActivityResourceConfig | undefined
	register: (key: string, config: ActivityResourceConfig) => void
	/** Shallow-merges over an existing entry. A missing key is left alone. */
	update: (key: string, partial: Partial<ActivityResourceConfig>) => void
	remove: (key: string) => void
	setAll: (registry: ActivityResourceRegistry) => void
	/** Back to the `resources` prop as it was last seen. */
	reset: () => void
}

export function useActivityResources({
	resources,
	onResourcesChange,
}: UseActivityResourcesOptions = {}): UseActivityResourcesReturn {
	const [registry, setRegistry] = useState<ActivityResourceRegistry>(() => resources ?? {})

	/* Re-seeded on the prop's identity, not its contents, so local edits survive re-renders. */
	const seed = useRef(resources)
	useEffect(() => {
		if (resources !== seed.current) {
			seed.current = resources
			setRegistry(resources ?? {})
		}
	}, [resources])

	const onChange = useRef(onResourcesChange)
	useEffect(() => {
		onChange.current = onResourcesChange
	})

	const emit = useCallback((next: ActivityResourceRegistry) => onChange.current?.(next), [])

	const register = useCallback(
		(key: string, config: ActivityResourceConfig) =>
			setRegistry((current) => {
				const next = { ...current, [key]: config }
				emit(next)
				return next
			}),
		[emit],
	)

	const update = useCallback(
		(key: string, partial: Partial<ActivityResourceConfig>) =>
			setRegistry((current) => {
				const existing = current[key]
				// Nothing to merge into; a partial insert would have no label.
				if (!existing) return current
				const next = { ...current, [key]: { ...existing, ...partial } }
				emit(next)
				return next
			}),
		[emit],
	)

	const remove = useCallback(
		(key: string) =>
			setRegistry((current) => {
				if (!(key in current)) return current
				const next = { ...current }
				delete next[key]
				emit(next)
				return next
			}),
		[emit],
	)

	const setAll = useCallback(
		(next: ActivityResourceRegistry) => {
			setRegistry(next)
			emit(next)
		},
		[emit],
	)

	const reset = useCallback(() => {
		const next = seed.current ?? {}
		setRegistry(next)
		emit(next)
	}, [emit])

	const get = useCallback(
		(ref: ActivityResourceRef | string) => registry[typeof ref === "string" ? ref : ref.key],
		[registry],
	)

	return { registry, get, register, update, remove, setAll, reset }
}
