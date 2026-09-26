/**
 * Media browser state without presentation. Consumer records remain immutable.
 * Edits use versioned local patches and roll back on failure; deletes enter the
 * removed set only after success. Uploaded records are prepended in local mode.
 * Selected records remain available across remote result changes.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { formatFileSize } from "@/components/primitives"

import type {
	MediaLibraryAccessors, MediaLibraryFetchResult, MediaLibraryItem, MediaLibraryItemPatch,
	MediaLibraryItemType, MediaLibrarySort, MediaLibraryStagedFile, MediaLibraryState,
	MediaLibraryTab, MediaLibraryTypeFilter, MediaLibraryUploadOptions,
	MediaLibraryUploadStatus, MediaLibraryView, ResolvedMediaLibraryAccessors,
	UseMediaLibraryOptions,
} from "./media-library.types"

const DEFAULT_UPLOAD_OPTIONS: MediaLibraryUploadOptions = {
	collection: undefined,
	tags: [],
	public: true,
}

/** A stable empty array for memo dependencies. */
const EMPTY: readonly unknown[] = []

/** The hook supplies recovery controls even when a legacy state adapter omits them. */
type ResolvedMediaLibraryState<TItem> = MediaLibraryState<TItem> &
	Required<Pick<MediaLibraryState<TItem>, "fetchError" | "refetch" | "selectVisible" | "deselectVisible">>

function useControllableState<T>(
	controlled: T | undefined,
	defaultValue: T,
	onChange: ((value: T) => void) | undefined,
) {
	const [internal, setInternal] = useState(defaultValue)
	const value = controlled ?? internal

	const setValue = useCallback(
		(next: T | ((current: T) => T)) => {
			const resolved = typeof next === "function" ? (next as (current: T) => T)(value) : next
			if (controlled === undefined) setInternal(resolved)
			// Fires either way: a controlled parent must hear about the attempt.
			onChange?.(resolved)
		},
		[controlled, onChange, value],
	)

	return [value, setValue] as const
}

const DEFAULT_ACCESSORS: ResolvedMediaLibraryAccessors<MediaLibraryItem> = {
	getId: (item) => item.id,
	getName: (item) => item.name,
	getType: (item) => item.type,
	getSrc: (item) => item.src,
	getAlt: (item) => item.alt,
	getSize: (item) => item.size,
	getWidth: (item) => item.width,
	getHeight: (item) => item.height,
	getDuration: (item) => item.duration,
	getCollection: (item) => item.collection,
	getTags: (item) => item.tags ?? [],
	getPublic: (item) => item.public,
	getUploadedAt: (item) => item.uploadedAt,
	getUsageCount: (item) => item.usageCount,
	getTint: (item) => item.tint,
	getMimeType: (item) => item.mimeType,
}

export function resolveMediaLibraryAccessors<TItem = MediaLibraryItem>(
	accessors?: MediaLibraryAccessors<TItem>,
): ResolvedMediaLibraryAccessors<TItem> {
	return {
		...(DEFAULT_ACCESSORS as unknown as ResolvedMediaLibraryAccessors<TItem>),
		...(accessors ?? {}),
	}
}

export function formatMediaLibrarySize(bytes?: number): string {
	return bytes === undefined ? "" : formatFileSize(bytes)
}

export function getMediaLibraryDimensions<TItem>(
	item: TItem,
	accessors: ResolvedMediaLibraryAccessors<TItem>,
): string {
	const width = accessors.getWidth(item)
	const height = accessors.getHeight(item)
	if (!width || !height) return ""
	return `${width} × ${height}`
}

function uploadedTime<TItem>(item: TItem, accessors: ResolvedMediaLibraryAccessors<TItem>) {
	const value = accessors.getUploadedAt(item)
	if (!value) return 0
	const date = value instanceof Date ? value : new Date(value)
	const time = date.getTime()
	// An unparseable date sorts last instead of throwing.
	return Number.isFinite(time) ? time : 0
}

function inferType(file: File): MediaLibraryItemType {
	if (file.type.startsWith("image/")) return "image"
	if (file.type.startsWith("video/")) return "video"
	return "file"
}

/** Images only: other types get no preview. */
function createPreview(file: File): string | undefined {
	if (!file.type.startsWith("image/")) return undefined
	if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return undefined
	return URL.createObjectURL(file)
}

function revokePreview(url: string | undefined) {
	if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return
	URL.revokeObjectURL(url)
}

function normaliseResult<TItem>(
	result: MediaLibraryFetchResult<TItem> | TItem[],
): MediaLibraryFetchResult<TItem> {
	return Array.isArray(result) ? { items: result, total: result.length } : result
}

function applyPatch<TItem>(item: TItem, patch?: MediaLibraryItemPatch): TItem {
	if (!patch) return item
	if (typeof item === "object" && item !== null) return { ...(item as object), ...patch } as TItem
	return item
}

function filterItems<TItem>(
	items: TItem[],
	accessors: ResolvedMediaLibraryAccessors<TItem>,
	query: string,
	type: string,
	collection: string,
) {
	const needle = query.trim().toLowerCase()

	return items.filter((item) => {
		if (type !== "all" && accessors.getType(item) !== type) return false
		if (collection !== "all" && accessors.getCollection(item) !== collection) return false
		if (!needle) return true

		/* Name, alt, collection and tags are searched. */
		return [
			accessors.getName(item),
			accessors.getAlt(item),
			accessors.getCollection(item),
			...accessors.getTags(item),
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase()
			.includes(needle)
	})
}

function sortItems<TItem>(
	items: TItem[],
	accessors: ResolvedMediaLibraryAccessors<TItem>,
	sort: MediaLibrarySort,
) {
	const sorted = [...items]

	switch (sort) {
		case "name":
			return sorted.sort((left, right) =>
				accessors.getName(left).localeCompare(accessors.getName(right)),
			)
		case "size":
			return sorted.sort((left, right) => (accessors.getSize(right) ?? 0) - (accessors.getSize(left) ?? 0))
		case "usage":
			return sorted.sort(
				(left, right) => (accessors.getUsageCount(right) ?? 0) - (accessors.getUsageCount(left) ?? 0),
			)
		default:
			return sorted.sort((left, right) => uploadedTime(right, accessors) - uploadedTime(left, accessors))
	}
}

export function useMediaLibrary<TItem = MediaLibraryItem>({
	items: itemsProp = EMPTY as readonly TItem[],
	fetcher,
	accessors: accessorsProp,
	selectionMode = "multiple",
	value,
	defaultValue,
	onValueChange,
	onItemUpdate,
	applyItemPatch = applyPatch,
	onItemDelete,
	onUpload,
	onError,
	tab: tabProp,
	defaultTab = "library",
	onTabChange,
	view: viewProp,
	defaultView = "grid",
	onViewChange,
	query: queryProp,
	defaultQuery = "",
	onQueryChange,
	type: typeProp,
	defaultType = "all",
	onTypeChange,
	collection: collectionProp,
	defaultCollection = "all",
	onCollectionChange,
	sort: sortProp,
	defaultSort = "newest",
	onSortChange,
	uploadOptions: uploadOptionsProp,
	defaultUploadOptions,
	onUploadOptionsChange,
}: UseMediaLibraryOptions<TItem>): ResolvedMediaLibraryState<TItem> {
	const accessors = useMemo(
		() => resolveMediaLibraryAccessors(accessorsProp),
		[accessorsProp],
	)

	const [tab, setTab] = useControllableState<MediaLibraryTab>(tabProp, defaultTab, onTabChange)
	const [view, setView] = useControllableState<MediaLibraryView>(viewProp, defaultView, onViewChange)
	const [query, setQuery] = useControllableState(queryProp, defaultQuery, onQueryChange)
	const [type, setType] = useControllableState<MediaLibraryTypeFilter>(typeProp, defaultType, onTypeChange)
	const [collection, setCollection] = useControllableState(collectionProp, defaultCollection, onCollectionChange)
	const [sort, setSort] = useControllableState<MediaLibrarySort>(sortProp, defaultSort, onSortChange)

	const [detailId, setDetailId] = useState<string | null>(null)
	const [internalValue, setInternalValue] = useState<string[]>(() => [...(defaultValue ?? [])])

	const [fetchedItems, setFetchedItems] = useState<TItem[]>([])
	const [fetchedTotal, setFetchedTotal] = useState<number | undefined>()
	const [loading, setLoading] = useState(false)
	// A failed edit/upload must keep its own recovery path, not offer a fetch retry.
	const [failure, setFailure] = useState<{ error: unknown; source: "fetch" | "mutation" } | null>(null)
	const setError = useCallback((error: unknown, source: "fetch" | "mutation" = "mutation") => {
		setFailure(error == null ? null : { error, source })
	}, [])
	const error = failure?.source === "fetch" && !fetcher ? null : failure?.error ?? null
	const fetchError = failure?.source === "fetch" && fetcher ? failure.error : null
	const [fetchVersion, setFetchVersion] = useState(0)
	const refetch = useCallback(() => setFetchVersion((version) => version + 1), [])
	// Callback identity is not a query parameter; report to the latest committed callback.
	const accessorsRef = useRef(accessors)
	useEffect(() => { accessorsRef.current = accessors }, [accessors])
	const onErrorRef = useRef(onError)
	useEffect(() => { onErrorRef.current = onError }, [onError])

	/* Local overlays over the consumer's records, which are never written (see the file header). */
	const [createdItems, setCreatedItems] = useState<TItem[]>([])
	const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set())
	const [itemPatches, setItemPatches] = useState<Record<string, MediaLibraryItemPatch>>({})

	const [stagedFiles, setStagedFiles] = useState<MediaLibraryStagedFile[]>([])
	const [uploading, setUploading] = useState(false)

	const resolvedDefaultUploadOptions = useMemo<MediaLibraryUploadOptions>(
		() => ({
			...DEFAULT_UPLOAD_OPTIONS,
			...defaultUploadOptions,
			tags: defaultUploadOptions?.tags ?? DEFAULT_UPLOAD_OPTIONS.tags,
		}),
		[defaultUploadOptions],
	)

	const controlledUploadOptions = useMemo<MediaLibraryUploadOptions | undefined>(
		() =>
			uploadOptionsProp
				? {
						...DEFAULT_UPLOAD_OPTIONS,
						...uploadOptionsProp,
						tags: uploadOptionsProp.tags ?? DEFAULT_UPLOAD_OPTIONS.tags,
					}
				: undefined,
		[uploadOptionsProp],
	)

	const [uploadOptions, setUploadOptions] = useControllableState(
		controlledUploadOptions,
		resolvedDefaultUploadOptions,
		onUploadOptionsChange,
	)

	const isSelectionControlled = value !== undefined
	const selectedIds = useMemo(
		() => {
			const ids = [...new Set(isSelectionControlled ? value ?? [] : internalValue)]
			return selectionMode === "single" ? ids.slice(0, 1) : ids
		},
		[internalValue, isSelectionControlled, selectionMode, value],
	)
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

	const objectUrls = useRef<Set<string>>(new Set())
	const uploadController = useRef<AbortController | null>(null)
	const mutationVersions = useRef<Map<string, number>>(new Map())
	const selectedRecords = useRef(new Map<string, TItem>())
	const [retainedRecords, setRetainedRecords] = useState(new Map<string, TItem>())
	const latestSelection = useRef(selectedIds)
	useEffect(() => { latestSelection.current = selectedIds }, [selectedIds])
	const stagedSequence = useRef(0)

	/* Server mode. Every change to a query parameter aborts the request before it. */
	useEffect(() => {
		if (!fetcher) return

		const controller = new AbortController()
		// oxlint-disable-next-line react/set-state-in-effect -- the effect owns a fetch with an AbortController; "a request is in flight" is the network's state, not the props'
		setLoading(true)
		setError(null)

		;(async () => fetcher({
			query,
			type,
			// `undefined`, not "all" — a server should not have to know that word.
			collection: collection === "all" ? undefined : collection,
			sort,
			signal: controller.signal,
		}))()
			.then((result) => {
				if (controller.signal.aborted) return
				const normalised = normaliseResult(result)
				setRetainedRecords((current) => {
					const selected = new Set(latestSelection.current)
					return new Map([...current, ...normalised.items.map((item): [string, TItem] => [accessorsRef.current.getId(item), item])].filter(([id]) => selected.has(id)))
				})
				setFetchedItems(normalised.items)
				setFetchedTotal(normalised.total)
			})
			.catch((nextError: unknown) => {
				if (controller.signal.aborted) return
				setError(nextError, "fetch")
				onErrorRef.current?.(nextError)
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false)
			})

		return () => controller.abort()
	}, [collection, fetcher, fetchVersion, query, setError, sort, type])

	/* Object URLs are held until revoked, so every one made is released on unmount. */
	useEffect(() => {
		const urls = objectUrls.current
		return () => {
			uploadController.current?.abort()
			for (const url of urls) revokePreview(url)
			urls.clear()
		}
	}, [])

	const sourceItems = useMemo(
		() => (fetcher ? fetchedItems : [...createdItems, ...itemsProp]),
		[createdItems, fetchedItems, fetcher, itemsProp],
	)

	const items = useMemo(
		() => [...new Map(sourceItems.map((item) => [accessors.getId(item), item])).values()]
			.filter((item) => !removedIds.has(accessors.getId(item)))
			.map((item) => itemPatches[accessors.getId(item)] ? applyItemPatch(item, itemPatches[accessors.getId(item)]!) : item),
		[accessors, applyItemPatch, itemPatches, removedIds, sourceItems],
	)

	const visibleItems = useMemo(() => {
		// In server mode the fetcher already filtered and sorted.
		if (fetcher) return items
		return sortItems(filterItems(items, accessors, query, type, collection), accessors, sort)
	}, [accessors, collection, fetcher, items, query, sort, type])

	const records = useMemo(() => new Map(items.map((item) => [accessors.getId(item), item])), [accessors, items])
	const selectedItems = selectedIds.flatMap((id) => {
		const item = records.get(id) ?? retainedRecords.get(id)
		return item === undefined ? [] : [item]
	})
	useEffect(() => {
		for (const id of selectedRecords.current.keys()) if (!selectedSet.has(id)) selectedRecords.current.delete(id)
		for (const id of selectedIds) {
			const item = records.get(id)
			if (item !== undefined) selectedRecords.current.set(id, item)
		}
	}, [records, selectedIds, selectedSet])

	const applySelection = useCallback(
		(nextIds: string[]) => {
			const unique = [...new Set(nextIds)]
			const next = selectionMode === "single" ? unique.slice(0, 1) : unique
			latestSelection.current = next
			if (!isSelectionControlled) setInternalValue(next)
			const nextItems = next.flatMap((id) => {
				const item = records.get(id) ?? selectedRecords.current.get(id)
				if (item === undefined) return []
				selectedRecords.current.set(id, item)
				return [item]
			})
			setRetainedRecords(new Map(nextItems.map((item) => [accessors.getId(item), item])))
			onValueChange?.(next, nextItems)
		},
		[accessors, isSelectionControlled, onValueChange, records, selectionMode],
	)

	const toggleSelection = useCallback(
		(id: string) => {
			if (!records.has(id) && !selectedRecords.current.has(id)) return
			/* Single-select replaces rather than toggling off, so a picker never ends up empty by accident. */
			if (selectionMode === "single") {
				applySelection([id])
				return
			}
			const next = new Set(latestSelection.current)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			applySelection([...next])
		},
		[applySelection, records, selectionMode],
	)

	const clearSelection = useCallback(() => applySelection([]), [applySelection])
	const selectVisible = useCallback(() => applySelection([...latestSelection.current, ...visibleItems.map(accessors.getId)]), [accessors, applySelection, visibleItems])
	const deselectVisible = useCallback(() => {
		const visible = new Set(visibleItems.map(accessors.getId))
		applySelection(latestSelection.current.filter((id) => !visible.has(id)))
	}, [accessors, applySelection, visibleItems])

	const clearFilters = useCallback(() => {
		setQuery("")
		setType("all")
		setCollection("all")
	}, [setCollection, setQuery, setType])

	const addFiles = useCallback((files: File[]) => {
		if (uploadController.current) return
		const added = files.map((file) => {
				const src = createPreview(file)
				if (src) objectUrls.current.add(src)
				return {
					id: `staged-${++stagedSequence.current}`,
					file,
					name: file.name,
					size: file.size,
					type: inferType(file),
					src,
					progress: 0,
					status: "staged" as const,
				}
			})
		setStagedFiles((current) => [...current, ...added])
	}, [])

	const removeStagedFile = useCallback((id: string) => {
		if (uploadController.current) return
		setStagedFiles((current) => {
			const target = current.find((file) => file.id === id)
			if (target?.src) {
				revokePreview(target.src)
				objectUrls.current.delete(target.src)
			}
			return current.filter((file) => file.id !== id)
		})
	}, [])

	const clearStagedFiles = useCallback(() => {
		if (uploadController.current) return
		setStagedFiles((current) => {
			for (const file of current) {
				if (file.src) {
					revokePreview(file.src)
					objectUrls.current.delete(file.src)
				}
			}
			return []
		})
	}, [])

	const updateUploadOptions = useCallback(
		(patch: Partial<MediaLibraryUploadOptions>) => {
			setUploadOptions((current) => ({ ...current, ...patch }))
		},
		[setUploadOptions],
	)

	const patchStagedFile = useCallback(
		(
			fileId: string,
			patch: Partial<Pick<MediaLibraryStagedFile, "progress" | "status" | "error">>,
		) => {
			setStagedFiles((current) =>
				current.map((file) => (file.id === fileId ? { ...file, ...patch } : file)),
			)
		},
		[],
	)

	const startUpload = useCallback(async () => {
		if (!onUpload || uploadController.current || stagedFiles.length === 0) return

		const controller = new AbortController()
		uploadController.current = controller

		setError(null)
		setUploading(true)
		setStagedFiles((current) =>
			current.map((file) => ({ ...file, status: "uploading", progress: 0, error: undefined })),
		)

		const failedIds = new Set<string>()
		const batchIds = new Set(stagedFiles.map((file) => file.id))
		const isCurrent = () => !controller.signal.aborted && uploadController.current === controller
		const helpers = {
			files: stagedFiles,
			signal: controller.signal,
			setProgress: (fileId: string, progress: number) => {
				if (!isCurrent() || !batchIds.has(fileId)) return
				patchStagedFile(fileId, { progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0 })
			},
			setFileStatus: (
				fileId: string,
				status: MediaLibraryUploadStatus,
				fileError?: string,
			) => {
				if (!isCurrent() || !batchIds.has(fileId)) return
				if (status === "error") failedIds.add(fileId)
				else failedIds.delete(fileId)
				patchStagedFile(fileId, { status, error: fileError })
			},
		}

		try {
			const uploaded = await onUpload(
				stagedFiles.map((file) => file.file),
				uploadOptions,
				helpers,
			)
			if (controller.signal.aborted) return


			if (uploaded?.length) {
				setCreatedItems((current) => [...uploaded, ...current])
				for (const item of uploaded) selectedRecords.current.set(accessors.getId(item), item)
				const uploadedIds = uploaded.map((item) => accessors.getId(item))
				// Newly uploaded assets are selected: they were uploaded to be used.
				applySelection(
					selectionMode === "single"
						? uploadedIds.slice(0, 1)
						: [...new Set([...uploadedIds, ...latestSelection.current])],
				)
			}

			for (const file of stagedFiles) {
				if (!failedIds.has(file.id) && file.src) { revokePreview(file.src); objectUrls.current.delete(file.src) }
			}
			setStagedFiles((current) => current.filter((file) => !batchIds.has(file.id) || failedIds.has(file.id)))
			if (fetcher) refetch()
			if (failedIds.size === 0) setTab("library")
		} catch (nextError) {
			if (controller.signal.aborted) return
			setError(nextError)
			setStagedFiles((current) =>
				current.map((file) =>
					file.status === "uploading" ? { ...file, status: "error" } : file,
				),
			)
			onError?.(nextError)
		} finally {
			// Only if this upload is still the current one: a cancel already replaced it.
			if (uploadController.current === controller) {
				uploadController.current = null
				setUploading(false)
			}
		}
	}, [
		accessors, applySelection, onError, onUpload, patchStagedFile,
		fetcher, refetch, selectionMode, setError, setTab, stagedFiles, uploadOptions,
	])

	const cancelUpload = useCallback(() => {
		uploadController.current?.abort()
		uploadController.current = null
		setUploading(false)
		// Back to staged, not error: cancelling is not failing.
		setStagedFiles((current) =>
			current.map((file) =>
				file.status === "uploading"
					? { ...file, status: "staged", progress: 0, error: undefined }
					: file,
			),
		)
	}, [])

	const updateItem = useCallback(
		async (item: TItem, patch: MediaLibraryItemPatch): Promise<boolean> => {
			const id = accessors.getId(item)
			const key = `update:${id}`
			const version = (mutationVersions.current.get(key) ?? 0) + 1
			mutationVersions.current.set(key, version)

			const previous = itemPatches[id]
			setError(null)
			setItemPatches((current) => ({ ...current, [id]: { ...current[id], ...patch } }))

			try {
				await onItemUpdate?.(item, patch)
				return true
			} catch (nextError) {
				// A failed older request must not roll back a newer edit.
				if (mutationVersions.current.get(key) === version) {
					setItemPatches((current) => {
						const next = { ...current }
						if (previous) next[id] = previous
						else delete next[id]
						return next
					})
				}
				setError(nextError)
				onError?.(nextError)
				return false
			}
		},
		[accessors, itemPatches, onError, onItemUpdate, setError],
	)

	const removeItem = useCallback(
		async (item: TItem): Promise<boolean> => {
			const id = accessors.getId(item)
			setError(null)

			try {
				await onItemDelete?.(item)
				setRemovedIds((current) => new Set(current).add(id))
				if (latestSelection.current.includes(id)) {
					applySelection(latestSelection.current.filter((selectedId) => selectedId !== id))
				}
				return true
			} catch (nextError) {
				setError(nextError)
				onError?.(nextError)
				return false
			}
		},
		[accessors, applySelection, onError, onItemDelete, setError],
	)

	return {
		tab, setTab, view, setView, query, setQuery, type, setType,
		collection, setCollection, sort, setSort, detailId, setDetailId,
		items, visibleItems, selectedIds, selectedItems, selectedSet,
		toggleSelection, clearSelection, selectVisible, deselectVisible, clearFilters,
		loading: !!fetcher && loading, error, fetchError, refetch,
		hasFilters: !!query.trim() || type !== "all" || collection !== "all",
		totalCount: fetcher ? fetchedTotal ?? items.length : items.length,
		filteredCount: visibleItems.length,
		stagedFiles, addFiles, removeStagedFile, clearStagedFiles,
		uploadOptions, updateUploadOptions, uploading, startUpload, cancelUpload,
		updateItem, removeItem, accessors,
	}
}
