/**
 * The pieces the library is assembled from, exported so a custom layout can call
 * `useMediaLibrary()` and place them itself.
 */
import {
	ImageIcon, LayoutGridIcon, ListIcon, SearchIcon, CheckIcon, Table2Icon, MoreHorizontalIcon, XIcon,
} from "lucide-react"
import { type ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Checkbox, Select, ToggleField } from "@/components/base/choice-inputs"
import { Dropzone } from "@/components/base/upload"
import { Empty } from "@/components/base/feedback"
import { FormField } from "@/components/base/forms"
import { Input } from "@/components/base/text-inputs"
import { Progress } from "@/components/base/feedback"
import { Stack } from "@/components/base/structure"
import { TagsInput } from "@/components/base/value-inputs"
import { DisplayLabel, Text } from "@/components/base/typography"
import { FileSize } from "@/components/primitives"
import { cx } from "@/lib/cx"
import { resolveStrings } from "@/lib/strings"
import { defaultMediaLibraryStrings } from "./media-library.strings"

import {
	formatMediaLibrarySize, getMediaLibraryDimensions,
} from "./use-media-library"
import type { MediaLibraryStrings } from "./media-library.strings"
import type {
	MediaLibraryCollectionOption, MediaLibraryTab, MediaLibraryDensity,
	MediaLibraryItemType, MediaLibrarySelectionMode, MediaLibrarySort,
	MediaLibraryStagedFile, MediaLibraryTypeFilter, MediaLibraryUploadOptions,
	MediaLibraryView, ResolvedMediaLibraryAccessors,
} from "./media-library.types"
import styles from "./media-library.module.css"

import { MediaPreview } from "./media-preview"
import { TYPE_ICON } from "./media-icons"
export { MediaPreview } from "./media-preview"

function typeLabel(type: MediaLibraryItemType, strings: MediaLibraryStrings) {
	return strings.types[type]
}

/* ── Toolbar ──────────────────────────────────────────────────────────────────────── */

/**
 * One segmented control for both toolbar toggles. The active segment is `data-active`, so
 * the raised chip is styled once in the stylesheet.
 */
function Segmented({
	label,
	options,
	value,
	onValueChange,
	role = "group",
	className,
}: {
	label: string
	options: readonly { value: string; label: ReactNode; icon?: ReactNode; iconOnly?: boolean }[]
	value: string
	onValueChange: (value: string) => void
	role?: "group" | "tablist"
	className?: string
}) {
	return (
		<div role={role} aria-label={label} className={cx(styles.segmented, className)}>
			{options.map((option) => {
				const active = option.value === value
				return (
					<Button
						key={option.value}
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						iconOnly={option.iconOnly}
						role={role === "tablist" ? "tab" : undefined}
						aria-selected={role === "tablist" ? active : undefined}
						aria-pressed={role === "group" ? active : undefined}
						aria-label={option.iconOnly ? String(option.label) : undefined}
						data-active={active || undefined}
						className={styles.segment}
						onClick={() => onValueChange(option.value)}
					>
						{option.icon}
						{!option.iconOnly && option.label}
					</Button>
				)
			})}
		</div>
	)
}

export interface MediaLibraryEmptyStateProps {
	title: ReactNode
	description?: ReactNode
	icon?: ReactNode
	action?: ReactNode
	className?: string
}

/** The browser's empty state: bordered and inset, since it stands in for a grid. */
export function MediaLibraryEmptyState({
	title,
	description,
	icon,
	action,
	className,
}: MediaLibraryEmptyStateProps) {
	return (
		<Empty
			title={title}
			description={description ?? false}
			media={icon ?? <ImageIcon />}
			mediaVariant="icon-soft"
			padding="md"
			border
			action={action}
			className={cx("media-library-empty-state--component", styles.emptyState, className)}
		/>
	)
}

export interface MediaLibraryToolbarProps {
	query: string
	onQueryChange: (query: string) => void
	type: MediaLibraryTypeFilter
	onTypeChange: (type: MediaLibraryTypeFilter) => void
	typeFilters: readonly MediaLibraryTypeFilter[]
	collection: string
	onCollectionChange: (collection: string) => void
	collections: readonly MediaLibraryCollectionOption[]
	sort: MediaLibrarySort
	onSortChange: (sort: MediaLibrarySort) => void
	view: MediaLibraryView
	onViewChange: (view: MediaLibraryView) => void
	hasFilters: boolean
	onClearFilters: () => void
	strings: MediaLibraryStrings
	end?: ReactNode
	className?: string
}

export function MediaLibraryToolbar({
	query, onQueryChange, type, onTypeChange, typeFilters, collection, onCollectionChange,
	collections, sort, onSortChange, view, onViewChange, hasFilters, onClearFilters,
	strings, end, className,
}: MediaLibraryToolbarProps) {
	const trimmedQuery = query.trim()
	const copy = resolveStrings(defaultMediaLibraryStrings, strings)

	return (
		<div className={cx("media-library-toolbar--component", styles.toolbar, className)}>
			<div className={styles.toolbarPrimary}>
				<div className={styles.toolbarSearch}>
					<Input
						value={query}
						onChange={(event) => onQueryChange(event.target.value)}
						placeholder={strings.searchPlaceholder}
						aria-label={strings.searchPlaceholder}
						startIcon={SearchIcon}
						clearable
						onClear={() => onQueryChange("")}
						strings={{ clear: strings.clearSearch }}
						data-active={trimmedQuery ? true : undefined}
						className={styles.toolbarField}
					/>
					{/* The term restated: the field may have scrolled away, and the grid gives no other reason for being short. */}
					{!!trimmedQuery && (
						<div className={styles.toolbarQuery}>
							<Badge tone="primary">
								<SearchIcon aria-hidden />
								{strings.activeSearchLabel}
								<Text size="inherit" type="inherit" weight="normal" className={styles.queryTerm}>{trimmedQuery}</Text>
							</Badge>
						</div>
					)}
				</div>

				{typeFilters.length > 1 && (
					<Segmented
						role="tablist"
						label={strings.typeLabel}
						value={type}
						onValueChange={(next) => onTypeChange(next as MediaLibraryTypeFilter)}
						options={typeFilters.map((entry) => ({
							value: entry,
							label: entry === "all" ? strings.types.all : typeLabel(entry, strings),
							icon: entry === "all" ? undefined : TYPE_ICON[entry],
						}))}
						className={styles.toolbarTypes}
					/>
				)}
			</div>

			<div className={styles.toolbarSecondary}>
				<div className={styles.toolbarFilters}>
					{collections.length > 0 && (
						<Select
							aria-label={strings.collectionLabel}
							value={collection}
							options={[
								{ value: "all", label: strings.collectionAll },
								...collections.map((entry) => ({
									value: entry.value,
									label: typeof entry.label === "string" ? entry.label : entry.value,
								})),
							]}
							onValueChange={(next) => next && onCollectionChange(next)}
							className={styles.toolbarSelect}
						/>
					)}

					<Select
						aria-label={strings.sortLabel}
						value={sort}
						options={[
							{ value: "newest", label: strings.sorts.newest },
							{ value: "name", label: strings.sorts.name },
							{ value: "size", label: strings.sorts.size },
							{ value: "usage", label: strings.sorts.usage },
						]}
						onValueChange={(next) => next && onSortChange(next as MediaLibrarySort)}
						className={styles.toolbarSelect}
					/>

					{hasFilters && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onClearFilters}>
							{strings.clearFilters}
						</Button>
					)}
				</div>

				<div className={styles.toolbarEnd}>
					{end}
					<Segmented
						label={strings.viewLabel}
						value={view}
						onValueChange={(next) => onViewChange(next as MediaLibraryView)}
						options={[
							{ value: "grid", label: strings.views.grid, icon: <LayoutGridIcon />, iconOnly: true },
							{ value: "list", label: copy.views.list, icon: <ListIcon />, iconOnly: true },
							{ value: "table", label: strings.views.table, icon: <Table2Icon />, iconOnly: true },
						]}
					/>
				</div>
			</div>
		</div>
	)
}

/* ── One asset ────────────────────────────────────────────────────────────────────── */

export interface MediaLibraryCardProps<TItem> {
	item: TItem
	selected?: boolean
	density?: MediaLibraryDensity
	showMeta?: boolean
	selectionMode?: MediaLibrarySelectionMode
	accessors: ResolvedMediaLibraryAccessors<TItem>
	strings: MediaLibraryStrings
	onToggle?: () => void
	onDetails?: () => void
	className?: string
}

export function MediaLibraryCard<TItem>({
	item, selected = false, density = "comfortable", showMeta = true,
	accessors, strings, onToggle, onDetails, className,
}: MediaLibraryCardProps<TItem>) {
	const name = accessors.getName(item)
	const size = accessors.getSize(item)
	const dimensions = getMediaLibraryDimensions(item, accessors)

	return (
		<div
			data-selected={selected || undefined}
			data-media-density={density}
			className={cx("media-library-card--component", styles.card, className)}
		>
			{/* The tile owns selection; the decorative check shares its state. */}
			<span className={styles.cardTileWrap}>
				<button
					type="button"
					className={styles.cardTile}
					aria-pressed={selected}
					aria-label={(strings.assetAction ?? defaultMediaLibraryStrings.assetAction)(selected ? strings.deselect : strings.select, name)}
					onClick={onToggle}
				>
					<MediaPreview item={item} accessors={accessors} />
				</button>

				<span aria-hidden data-selected={selected || undefined} className={styles.cardCheck}>
					{selected && <CheckIcon />}
				</span>
			</span>

			<div className={styles.cardBody}>
				<Text tag="span" weight="medium" truncate title={name}>
					{name}
				</Text>
				{showMeta && (
					<Text tag="span" size="xs" type="secondary" truncate>
						{[dimensions, size === undefined ? "" : formatMediaLibrarySize(size)]
							.filter(Boolean)
							.join(" · ")}
					</Text>
				)}
			</div>

			{!!onDetails && (
				<Button
					type="button"
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					onClick={(event) => { event.currentTarget.focus(); onDetails() }}
					aria-label={(strings.assetAction ?? defaultMediaLibraryStrings.assetAction)(strings.details, name)}
					className={styles.cardDetails}
				>
					<MoreHorizontalIcon />
				</Button>
			)}

		</div>
	)
}

export interface MediaLibraryListProps<TItem> {
	items: readonly TItem[]
	selectedSet: Set<string>
	selectionMode?: MediaLibrarySelectionMode
	accessors: ResolvedMediaLibraryAccessors<TItem>
	strings: MediaLibraryStrings
	onToggle: (id: string) => void
	onDetails: (id: string) => void
}

export function MediaLibraryList<TItem>({
	items, selectedSet, accessors, strings, onToggle, onDetails,
}: MediaLibraryListProps<TItem>) {
	return (
		<ul className={cx("media-library-list--component", styles.list)}>
			{items.map((item) => {
				const id = accessors.getId(item)
				const name = accessors.getName(item)
				const selected = selectedSet.has(id)

				return (
					<li key={id}>
						<div data-selected={selected || undefined} className={styles.row}>
							<Checkbox checked={selected} aria-label={(strings.assetAction ?? defaultMediaLibraryStrings.assetAction)(selected ? strings.deselect : strings.select, name)} onChange={() => onToggle(id)} />
							<button
								type="button"
								className={styles.rowMain}
								aria-label={(strings.assetAction ?? defaultMediaLibraryStrings.assetAction)(strings.details, name)}
								onClick={(event) => { event.currentTarget.focus(); onDetails(id) }}
							>
								<MediaPreview item={item} accessors={accessors} className={styles.rowPreview} />
								<span className={styles.rowBody}>
									<Text tag="span" weight="medium" truncate>
										{name}
									</Text>
									<Text tag="span" size="xs" type="secondary">
										{[
											typeLabel(accessors.getType(item), strings),
											getMediaLibraryDimensions(item, accessors),
											accessors.getCollection(item),
										]
											.filter(Boolean)
											.join(" · ")}
									</Text>
								</span>
							</button>

							<span className={styles.rowSize}>
								<FileSize value={accessors.getSize(item)} size="xs" type="secondary" />
							</span>

							<Button
								type="button"
								tone="neutral"
								buttonStyle="ghost"
								onClick={(event) => { event.currentTarget.focus(); onDetails(id) }}
							>
								{strings.details}
							</Button>
						</div>
					</li>
				)
			})}
		</ul>
	)
}

/* ── Detail panel ─────────────────────────────────────────────────────────────────── */

export { MediaLibraryDetailPanel, type MediaLibraryDetailPanelProps } from "./media-library-detail"

/* ── Upload ───────────────────────────────────────────────────────────────────────── */

export interface MediaLibraryUploadPanelProps {
	/** Hide when a composed picker footer owns upload actions. */
	showActions?: boolean
	stagedFiles: MediaLibraryStagedFile[]
	uploading: boolean
	uploadOptions: MediaLibraryUploadOptions
	collections?: readonly MediaLibraryCollectionOption[]
	strings: MediaLibraryStrings
	onAddFiles: (files: File[]) => void
	onRemoveFile: (id: string) => void
	onClear: () => void
	onOptionsChange: (patch: Partial<MediaLibraryUploadOptions>) => void
	onStart: () => void
	onCancel: () => void
	empty?: ReactNode
}

export function MediaLibraryUploadPanel({
	stagedFiles, uploading, uploadOptions, collections = [], strings,
	onAddFiles, onRemoveFile, onClear, onOptionsChange, onStart, onCancel, empty, showActions = true,
}: MediaLibraryUploadPanelProps) {
	return (
		<div className={cx("media-library-upload--component", styles.upload)}>
			<Dropzone
				multiple
				disabled={uploading}
				onDrop={onAddFiles}
				strings={{
					instructionMultiple: strings.upload.dropTitle,
					helper: strings.upload.dropDescription,
				}}
			/>

			<section className={styles.uploadOptions}>
				<DisplayLabel>{strings.upload.optionsTitle}</DisplayLabel>
				<div className={styles.uploadOptionsGrid}>
					{collections.length > 0 && (
						<FormField label={strings.detail.collectionLabel}>
							<Select
								disabled={uploading}
								value={uploadOptions.collection ?? ""}
								options={collections.map((entry) => ({
									value: entry.value,
									label: typeof entry.label === "string" ? entry.label : entry.value,
								}))}
								onValueChange={(next) => onOptionsChange({ collection: next || undefined })}
							/>
						</FormField>
					)}
					<FormField label={strings.detail.tagsLabel}>
						<TagsInput
							disabled={uploading}
							value={uploadOptions.tags}
							onValueChange={(tags) => onOptionsChange({ tags })}
							placeholder={strings.detail.tagsPlaceholder}
						/>
					</FormField>
					<ToggleField
						disabled={uploading}
						label={strings.detail.publicLabel}
						description={strings.detail.publicDescription}
						value={uploadOptions.public}
						onValueChange={(next) => onOptionsChange({ public: next })}
					/>
				</div>
			</section>

			{stagedFiles.length === 0 ? (
				(empty ?? (
					<Empty
						title={strings.upload.emptyTitle}
						description={strings.upload.emptyDescription}
						padding="md"
					/>
				))
			) : (
				<>
					<ul className={styles.stagedList}>
						{stagedFiles.map((file) => (
							<li key={file.id} className={styles.staged}>
								<span className={styles.stagedIcon}>{TYPE_ICON[file.type]}</span>
								<span className={styles.stagedBody}>
									<Text tag="span" weight="medium" truncate>
										{file.name}
									</Text>
									{file.status === "error" ? (
										<Text tag="span" size="xs" type="error">
											{file.error ?? strings.upload.failed}
										</Text>
									) : file.status === "uploading" ? (
										<Progress value={file.progress} aria-label={file.name} />
									) : (
										<FileSize value={file.size} size="xs" type="secondary" />
									)}
								</span>
								<Button
									type="button"
									tone="neutral"
									buttonStyle="ghost"
									iconOnly
									aria-label={`${strings.upload.remove}: ${file.name}`}
									disabled={uploading}
									onClick={() => onRemoveFile(file.id)}
								>
									<XIcon />
								</Button>
							</li>
						))}
					</ul>

					{showActions && <div className={styles.uploadActions}>
						<Text type="secondary">{strings.upload.staged(stagedFiles.length)}</Text>
						<Stack direction="horizontal" gap="md">
							{uploading ? (
								<Button type="button" tone="neutral" buttonStyle="outline" onClick={onCancel}>
									{strings.upload.cancel}
								</Button>
							) : (
								<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onClear}>
									{strings.upload.clear}
								</Button>
							)}
							<Button type="button" loading={uploading} onClick={onStart}>
								{uploading ? strings.upload.uploading : strings.upload.start}
							</Button>
						</Stack>
					</div>}
				</>
			)}
		</div>
	)
}

/* ── Footer ────────────────────────────────────────────────────────────────────── */

export interface MediaLibraryFooterSummaryProps {
	tab: MediaLibraryTab
	selectedIds: readonly string[]
	selectionMode: MediaLibrarySelectionMode
	stagedFiles: readonly MediaLibraryStagedFile[]
	strings: MediaLibraryStrings
	/** With nothing selected and a filter on, the count replaces the hint. */
	visibleCount?: number
	totalCount?: number
	onClearSelection?: () => void
	className?: string
}

/**
 * The footer line: a selection count while browsing, a staged-file tally while uploading.
 * A live region, so keyboard picks inside the grid are announced.
 */
export function MediaLibraryFooterSummary({
	tab,
	selectedIds,
	selectionMode,
	stagedFiles,
	strings,
	visibleCount,
	totalCount,
	onClearSelection,
	className,
}: MediaLibraryFooterSummaryProps) {
	const body =
		tab === "upload" ? (
			<Text size="xs" type="secondary">
				{stagedFiles.length === 0
					? strings.footer.noFiles
					: strings.footer.stagedSummary(
							stagedFiles.length,
							formatMediaLibrarySize(
								stagedFiles.reduce((sum, file) => sum + file.size, 0),
							),
						)}
			</Text>
		) : selectedIds.length > 0 ? (
			<>
				<Text>{strings.selectedCount(selectedIds.length)}</Text>
				{!!onClearSelection && (
					<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onClearSelection}>
						{strings.clearSelection}
					</Button>
				)}
			</>
		) : visibleCount !== undefined && totalCount !== undefined && visibleCount !== totalCount ? (
			/* A filter is on and nothing is picked: say how much of the library is showing. */
			<Text size="xs" type="secondary">
				{strings.showingCount(visibleCount, totalCount)}
			</Text>
		) : (
			<Text size="xs" type="secondary">
				{selectionMode === "single" ? strings.footer.pickOne : strings.footer.pickMany}
			</Text>
		)

	return (
		<div
			aria-live="polite"
			className={cx("media-library-footer-summary--component", styles.footerSummary, className)}
		>
			{body}
		</div>
	)
}

export interface MediaLibraryFooterActionsProps<TItem> {
	tab: MediaLibraryTab
	selectedItems: readonly TItem[]
	selectedIds: readonly string[]
	stagedFiles: readonly MediaLibraryStagedFile[]
	uploading?: boolean
	strings: MediaLibraryStrings
	confirmLabel?: ReactNode
	cancelLabel?: ReactNode
	onCancel?: () => void
	onConfirm?: () => void
	onUpload?: () => void
	onCancelUpload?: () => void
	className?: string
}

export function MediaLibraryFooterActions<TItem>({
	tab,
	selectedIds,
	selectedItems,
	stagedFiles,
	uploading = false,
	strings,
	confirmLabel,
	cancelLabel,
	onCancel,
	onConfirm,
	onUpload,
	onCancelUpload,
	className,
}: MediaLibraryFooterActionsProps<TItem>) {
	/* Cancel comes first in the DOM; the stylesheet reverses the stacked layout so the primary action sits on top. */
	const wrapper = cx("media-library-footer-actions--component", styles.footerActions, className)

	if (tab === "upload") {
		return (
			<div className={wrapper}>
				<Button
					type="button"
					tone="neutral"
					buttonStyle="ghost"
				onClick={onCancelUpload}
				>
					{uploading ? strings.upload.cancel : cancelLabel ?? strings.cancel}
				</Button>
				<Button
					type="button"
					disabled={stagedFiles.length === 0 || uploading}
					loading={uploading}
					onClick={onUpload}
				>
					{strings.footer.uploadStaged(stagedFiles.length)}
				</Button>
			</div>
		)
	}

	return (
		<div className={wrapper}>
			<Button type="button" tone="neutral" buttonStyle="outline" onClick={onCancel}>
				{uploading ? strings.upload.cancel : cancelLabel ?? strings.cancel}
			</Button>
			<Button type="button" disabled={selectedIds.length === 0 || selectedItems.length !== selectedIds.length} onClick={onConfirm}>
				{confirmLabel ?? strings.confirm}
			</Button>
		</div>
	)
}

export interface MediaLibraryFooterProps<TItem>
	extends MediaLibraryFooterSummaryProps,
		Omit<MediaLibraryFooterActionsProps<TItem>, "className"> {
	/** `section` draws the rule and the inset; `bare` leaves both to a surrounding shell. */
	chrome?: "section" | "bare"
}

export function MediaLibraryFooter<TItem>({
	tab,
	selectedItems,
	selectedIds,
	selectionMode,
	stagedFiles,
	uploading,
	strings,
	visibleCount,
	totalCount,
	confirmLabel,
	cancelLabel,
	onCancel,
	onConfirm,
	onClearSelection,
	onUpload,
	onCancelUpload,
	chrome = "section",
	className,
}: MediaLibraryFooterProps<TItem>) {
	return (
		<footer
			data-chrome={chrome}
			className={cx("media-library-footer--component", styles.footer, className)}
		>
			<MediaLibraryFooterSummary
				tab={tab}
				selectedIds={selectedIds}
				selectionMode={selectionMode}
				stagedFiles={stagedFiles}
				strings={strings}
				visibleCount={visibleCount}
				totalCount={totalCount}
				onClearSelection={onClearSelection}
			/>
			<MediaLibraryFooterActions<TItem>
				tab={tab}
				selectedItems={selectedItems}
				selectedIds={selectedIds}
				stagedFiles={stagedFiles}
				uploading={uploading}
				strings={strings}
				confirmLabel={confirmLabel}
				cancelLabel={cancelLabel}
				onCancel={onCancel}
				onConfirm={onConfirm}
				onUpload={onUpload}
				onCancelUpload={onCancelUpload}
			/>
		</footer>
	)
}
