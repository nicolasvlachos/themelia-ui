/**
 * MediaLibrary: the asset browser and its shapes.
 *
 * Every field is read through an accessor defaulting to `MediaLibraryItem`'s names, so any
 * record shape works without a mapping pass (which would break identity and selection).
 * Without a `fetcher` the library searches, filters and sorts `items`; with one, the
 * fetcher owns all three and `items` is ignored.
 */
import type { ComponentPropsWithoutRef, ReactNode } from "react"

import type { MediaLibraryStrings } from "./media-library.strings"

export type MediaLibraryItemType = "image" | "video" | "file"
export type MediaLibrarySelectionMode = "single" | "multiple"
export type MediaLibraryView = "grid" | "table" | "list"
export type MediaLibraryTab = "library" | "upload"
export type MediaLibraryDensity = "comfortable" | "compact"
export type MediaResourceGalleryLayout = "field" | "grid" | "list"
export type MediaLibrarySort = "newest" | "name" | "size" | "usage"
export type MediaLibraryTypeFilter = "all" | MediaLibraryItemType
export type MediaLibraryUploadStatus = "staged" | "uploading" | "done" | "error"

/** The default shape, and what the default accessors read. */
export interface MediaLibraryItem {
	id: string
	name: string
	type: MediaLibraryItemType
	src?: string
	alt?: string
	/** In bytes. */
	size?: number
	width?: number
	height?: number
	duration?: string
	collection?: string
	tags?: string[]
	public?: boolean
	uploadedAt?: Date | string
	/** How many places reference it; decides whether a delete is safe. */
	usageCount?: number
	/** A placeholder colour for an asset with no preview. */
	tint?: string
	mimeType?: string
}

/** The editable fields. Everything else about an asset belongs to whatever made it. */
export interface MediaLibraryItemPatch {
	alt?: string
	collection?: string
	tags?: string[]
	public?: boolean
}

export interface MediaLibraryCollectionOption {
	value: string
	label: ReactNode
}

export interface MediaLibraryUploadOptions {
	collection?: string
	tags: string[]
	public: boolean
}

export interface MediaLibraryStagedFile {
	id: string
	file: File
	name: string
	size: number
	type: MediaLibraryItemType
	/** An object URL for an image preview. Revoked when the file leaves. */
	src?: string
	progress: number
	status: MediaLibraryUploadStatus
	error?: string
}

export interface MediaLibraryFetchParams {
	query: string
	type: MediaLibraryTypeFilter
	/** `undefined` rather than "all", so a server need not know that word. */
	collection?: string
	sort: MediaLibrarySort
	limit?: number
	signal?: AbortSignal
}

export interface MediaLibraryFetchResult<TItem = MediaLibraryItem> {
	items: TItem[]
	/** Across every page. Without it the count reflects only what is loaded. */
	total?: number
}

/** A bare array is accepted too, for a fetcher with nothing to say about totals. */
export type MediaLibraryFetcher<TItem = MediaLibraryItem> = (
	params: MediaLibraryFetchParams,
) => Promise<MediaLibraryFetchResult<TItem> | TItem[]>

export interface MediaLibraryUploadHelpers {
	/** Stable IDs for the submitted batch, used by the progress/status callbacks. */
	files?: readonly MediaLibraryStagedFile[]
	/** Aborted when the reader cancels, or when the library unmounts. */
	signal: AbortSignal
	setProgress: (fileId: string, progress: number) => void
	setFileStatus: (fileId: string, status: MediaLibraryUploadStatus, error?: string) => void
}

/** Returning the created items adds AND selects them; returning nothing just finishes. */
export type MediaLibraryUploadHandler<TItem = MediaLibraryItem> = (
	files: File[],
	options: MediaLibraryUploadOptions,
	helpers: MediaLibraryUploadHelpers,
) => Promise<TItem[] | void> | TItem[] | void

export interface MediaLibraryAccessors<TItem = MediaLibraryItem> {
	getId?: (item: TItem) => string
	getName?: (item: TItem) => string
	getType?: (item: TItem) => MediaLibraryItemType
	getSrc?: (item: TItem) => string | undefined
	getAlt?: (item: TItem) => string | undefined
	getSize?: (item: TItem) => number | undefined
	getWidth?: (item: TItem) => number | undefined
	getHeight?: (item: TItem) => number | undefined
	getDuration?: (item: TItem) => string | undefined
	getCollection?: (item: TItem) => string | undefined
	getTags?: (item: TItem) => string[]
	getPublic?: (item: TItem) => boolean | undefined
	getUploadedAt?: (item: TItem) => Date | string | undefined
	getUsageCount?: (item: TItem) => number | undefined
	getTint?: (item: TItem) => string | undefined
	getMimeType?: (item: TItem) => string | undefined
}

export type ResolvedMediaLibraryAccessors<TItem = MediaLibraryItem> = Required<
	MediaLibraryAccessors<TItem>
>

export interface MediaLibraryItemRenderContext<TItem = MediaLibraryItem> {
	id: string
	selected: boolean
	selectionMode: MediaLibrarySelectionMode
	accessors: ResolvedMediaLibraryAccessors<TItem>
	toggle: () => void
	openDetails: () => void
}

export interface MediaLibraryDetailRenderContext<TItem = MediaLibraryItem> {
	accessors: ResolvedMediaLibraryAccessors<TItem>
	/** Resolves `false` after a rollback when the consumer's mutation failed. */
	update: (patch: MediaLibraryItemPatch) => Promise<boolean>
	remove: () => Promise<boolean>
	close: () => void
}

export interface MediaLibrarySlots<TItem = MediaLibraryItem> {
	headerStart?: ReactNode
	headerEnd?: ReactNode
	toolbarEnd?: ReactNode
	empty?: ReactNode
	loading?: ReactNode
	error?: ReactNode
	footer?: ReactNode
	uploadEmpty?: ReactNode
	renderItem?: (item: TItem, context: MediaLibraryItemRenderContext<TItem>) => ReactNode
	renderDetail?: (item: TItem, context: MediaLibraryDetailRenderContext<TItem>) => ReactNode
}

export interface MediaLibraryState<TItem = MediaLibraryItem> {
	tab: MediaLibraryTab
	setTab: (tab: MediaLibraryTab) => void
	view: MediaLibraryView
	setView: (view: MediaLibraryView) => void
	query: string
	setQuery: (query: string) => void
	type: MediaLibraryTypeFilter
	setType: (type: MediaLibraryTypeFilter) => void
	collection: string
	setCollection: (collection: string) => void
	sort: MediaLibrarySort
	setSort: (sort: MediaLibrarySort) => void
	detailId: string | null
	setDetailId: (id: string | null) => void

	/** Every asset, after local edits and deletions. */
	items: TItem[]
	/** What the current filters and sort leave. */
	visibleItems: TItem[]
	selectedIds: string[]
	selectedItems: TItem[]
	/** For a per-row lookup that would otherwise be O(n) inside a map. */
	selectedSet: Set<string>
	toggleSelection: (id: string) => void
	clearSelection: () => void
	/** Select/deselect only the currently visible records, preserving other selections. */
	selectVisible?: () => void
	deselectVisible?: () => void
	clearFilters: () => void

	loading: boolean
	/** Most recent fetch or mutation failure; cleared when an operation starts. */
	error: unknown
	/** Always supplied by useMediaLibrary; optional for existing consumer-owned states. */
	fetchError?: unknown
	/** Stable query reload, always supplied by useMediaLibrary; a no-op in local mode. */
	refetch?: () => void
	hasFilters: boolean
	totalCount: number
	filteredCount: number

	stagedFiles: MediaLibraryStagedFile[]
	addFiles: (files: File[]) => void
	removeStagedFile: (id: string) => void
	clearStagedFiles: () => void
	uploadOptions: MediaLibraryUploadOptions
	updateUploadOptions: (patch: Partial<MediaLibraryUploadOptions>) => void
	uploading: boolean
	startUpload: () => Promise<void>
	cancelUpload: () => void

	updateItem: (item: TItem, patch: MediaLibraryItemPatch) => Promise<boolean>
	removeItem: (item: TItem) => Promise<boolean>
	accessors: ResolvedMediaLibraryAccessors<TItem>
}

export interface UseMediaLibraryOptions<TItem = MediaLibraryItem> {
	/** Ignored entirely when `fetcher` is set. */
	items?: readonly TItem[]
	/** Supplying it hands searching, filtering, and sorting to the server. */
	fetcher?: MediaLibraryFetcher<TItem>
	accessors?: MediaLibraryAccessors<TItem>
	collections?: readonly MediaLibraryCollectionOption[]
	selectionMode?: MediaLibrarySelectionMode

	value?: readonly string[]
	defaultValue?: readonly string[]
	onValueChange?: (ids: string[], items: TItem[]) => void

	onItemUpdate?: (item: TItem, patch: MediaLibraryItemPatch) => void | Promise<void>
	/** Applies editable fields to a custom record shape without mutating the original. */
	applyItemPatch?: (item: TItem, patch: MediaLibraryItemPatch) => TItem
	onItemDelete?: (item: TItem) => void | Promise<void>
	onUpload?: MediaLibraryUploadHandler<TItem>
	/** Receives failures from the fetcher, uploads, updates, and deletes. */
	onError?: (error: unknown) => void

	tab?: MediaLibraryTab
	defaultTab?: MediaLibraryTab
	onTabChange?: (tab: MediaLibraryTab) => void
	view?: MediaLibraryView
	defaultView?: MediaLibraryView
	onViewChange?: (view: MediaLibraryView) => void
	query?: string
	defaultQuery?: string
	onQueryChange?: (query: string) => void
	type?: MediaLibraryTypeFilter
	defaultType?: MediaLibraryTypeFilter
	onTypeChange?: (type: MediaLibraryTypeFilter) => void
	collection?: string
	defaultCollection?: string
	onCollectionChange?: (collection: string) => void
	sort?: MediaLibrarySort
	defaultSort?: MediaLibrarySort
	onSortChange?: (sort: MediaLibrarySort) => void

	uploadOptions?: Partial<MediaLibraryUploadOptions>
	defaultUploadOptions?: Partial<MediaLibraryUploadOptions>
	onUploadOptionsChange?: (options: MediaLibraryUploadOptions) => void
}

export interface MediaLibraryProps<TItem = MediaLibraryItem>
	extends Omit<
			ComponentPropsWithoutRef<"section">,
			"children" | "defaultValue" | "onError" | "onSelect" | "title"
		>,
		UseMediaLibraryOptions<TItem> {
	title?: ReactNode
	description?: ReactNode
	confirmLabel?: ReactNode
	cancelLabel?: ReactNode
	density?: MediaLibraryDensity
	/** Shows each asset's size and dimensions under its name. */
	showMeta?: boolean
	allowUpload?: boolean
	typeFilters?: readonly MediaLibraryTypeFilter[]
	/** Picking confirms and the footer is removed. For a single-select picker. */
	confirmOnSelect?: boolean
	onConfirm?: (items: TItem[], ids: string[]) => void
	onCancel?: () => void
	onClose?: () => void
	/**
	 * Bulk actions for a selection, rendered in the shared BatchActionBar. Browsing only:
	 * a picker's footer already reports the selection, so the bar is suppressed there.
	 */
	bulkActions?: (context: MediaLibraryBulkActionContext<TItem>) => ReactNode
	strings?: Partial<MediaLibraryStrings>
	slots?: MediaLibrarySlots<TItem>
}

/** What a bulk action is handed; mirrors the product variants' context. */
export interface MediaLibraryBulkActionContext<TItem = MediaLibraryItem> {
	selectedItems: TItem[]
	selectedIds: string[]
	selectedCount: number
	/** Items passing the current filters, not the whole library. */
	visibleCount: number
	totalCount: number
	clearSelection: () => void
}

export interface MediaLibraryDialogProps<TItem = MediaLibraryItem>
	extends Omit<MediaLibraryProps<TItem>, "title" | "description"> {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	trigger?: ReactNode
	dialogTitle?: string
	dialogDescription?: string
	dialogClassName?: string
	contentClassName?: string
	closeOnEscape?: boolean
	closeOnBackdropClick?: boolean
}

export interface MediaResourceGalleryItemRenderContext<TItem = MediaLibraryItem> {
	id: string
	index: number
	total: number
	primary: boolean
	accessors: ResolvedMediaLibraryAccessors<TItem>
	canMovePrevious: boolean
	canMoveNext: boolean
	setPrimary: () => void
	remove: () => void
	movePrevious: () => void
	moveNext: () => void
}

export interface MediaResourceGalleryProps<TItem = MediaLibraryItem>
	extends Omit<ComponentPropsWithoutRef<"section">, "children" | "title"> {
	items: readonly TItem[]
	accessors?: MediaLibraryAccessors<TItem>
	title?: ReactNode
	description?: ReactNode
	/** The cover. */
	primaryId?: string
	onPrimaryChange?: (id: string, item: TItem) => void
	onRemove?: (id: string, item: TItem) => void
	onReorder?: (ids: string[], items: TItem[]) => void
	/** Usually opens the library dialog. */
	onAdd?: () => void
	/** The add control hides once reached. */
	maxItems?: number
	layout?: MediaResourceGalleryLayout
	density?: MediaLibraryDensity
	readOnly?: boolean
	empty?: ReactNode
	action?: ReactNode
	renderItem?: (
		item: TItem,
		context: MediaResourceGalleryItemRenderContext<TItem>,
	) => ReactNode
	strings?: Partial<MediaLibraryStrings>
}
