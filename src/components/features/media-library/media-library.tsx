/**
 * MediaLibrary: the asset browser, as a panel and as a dialog. The detail panel is a column
 * beside the grid, not an overlay, so several assets can be edited in a row.
 */
import { resolveStrings } from "@/lib/strings"
import { useMemo } from "react"

import { ActionDialog } from "@/components/features/overlays"
import { BatchActionBar } from "@/components/base/batch-action-bar"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { Alert, AlertAction, AlertDescription, ErrorState, LoadingState } from "@/components/base/feedback"
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/navigation"
import { cx } from "@/lib/cx"

import {
	MediaLibraryDetailPanel, MediaLibraryList, MediaLibraryToolbar,
	MediaLibraryEmptyState,
	MediaLibraryFooter,
	MediaLibraryUploadPanel,
} from "./media-library-parts"
import { defaultMediaLibraryStrings } from "./media-library.strings"
import { useMediaLibrary } from "./use-media-library"
import type {
	MediaLibraryDialogProps, MediaLibraryItem, MediaLibraryProps, MediaLibraryTypeFilter,
} from "./media-library.types"
import { MediaLibraryTable } from "./media-library-table"
import { MediaLibraryGrid, MediaLibrarySelectionBar } from "./media-library-views"
import styles from "./media-library.module.css"

const ALL_TYPES: readonly MediaLibraryTypeFilter[] = ["all", "image", "video", "file"]

export function MediaLibrary<TItem = MediaLibraryItem>({
	title,
	description,
	confirmLabel,
	cancelLabel,
	density = "comfortable",
	showMeta = true,
	allowUpload = true,
	typeFilters = ALL_TYPES,
	confirmOnSelect = false,
	onConfirm,
	onCancel,
	onClose,
	bulkActions,
	strings,
	slots,
	className,
	collections = [],
	selectionMode = "multiple",
	...options
}: MediaLibraryProps<TItem>) {
	const copy = useMemo(() => (resolveStrings(defaultMediaLibraryStrings, strings)), [strings])

	const { items, fetcher, accessors: customAccessors, value, defaultValue, onValueChange, onItemUpdate, applyItemPatch, onItemDelete, onUpload, onError, tab: controlledTab, defaultTab, onTabChange, view: controlledView, defaultView, onViewChange, query: controlledQuery, defaultQuery, onQueryChange, type: controlledType, defaultType, onTypeChange, collection: controlledCollection, defaultCollection, onCollectionChange, sort: controlledSort, defaultSort, onSortChange, uploadOptions, defaultUploadOptions, onUploadOptionsChange, ...sectionProps } = options
	const library = useMediaLibrary<TItem>({ items, fetcher, accessors: customAccessors, value, defaultValue, onValueChange, onItemUpdate, applyItemPatch, onItemDelete, onUpload, onError, tab: controlledTab, defaultTab, onTabChange, view: controlledView, defaultView, onViewChange, query: controlledQuery, defaultQuery, onQueryChange, type: controlledType, defaultType, onTypeChange, collection: controlledCollection, defaultCollection, onCollectionChange, sort: controlledSort, defaultSort, onSortChange, uploadOptions, defaultUploadOptions, onUploadOptionsChange, collections, selectionMode })
	const {
		tab, setTab, view, setView, query, setQuery, type, setType, collection, setCollection,
		sort, setSort, detailId, setDetailId, visibleItems, selectedIds, selectedItems,
		selectedSet, toggleSelection, clearSelection, clearFilters, loading,
		hasFilters, totalCount, filteredCount, accessors, fetchError, refetch,
	} = library

	const detailItem = useMemo(
		() => library.items.find((item) => accessors.getId(item) === detailId) ?? null,
		[accessors, detailId, library.items],
	)

	/* A picker reports selection in its footer, a browsing library in the batch bar; never both. */
	const hasPickerFooter = !confirmOnSelect && !!onConfirm

	/* With `confirmOnSelect`, picking confirms and there is no footer. */
	const handleToggle = (id: string) => {
		toggleSelection(id)
		if (!confirmOnSelect) return
		const item = library.items.find((entry) => accessors.getId(entry) === id)
		if (item) onConfirm?.([item], [id])
		onClose?.()
	}

	const body = (() => {
		if (loading && visibleItems.length === 0) return slots?.loading ?? <LoadingState label={copy.loading} aria-hidden="true" aria-live="off" className={styles.emptyState} />

		if (fetchError && visibleItems.length === 0) {
			return (
				slots?.error ?? (
					<ErrorState
						title={copy.error}
						description={false}
						className={styles.emptyState}
						onRetry={fetchError ? refetch : undefined}
						strings={{ retry: copy.retry }}
					/>
				)
			)
		}

		if (visibleItems.length === 0) {
			return (
				slots?.empty ?? (
					<MediaLibraryEmptyState
						title={hasFilters ? copy.emptyFilteredTitle : copy.emptyTitle}
						description={hasFilters ? copy.emptyFilteredDescription : copy.emptyDescription}
						action={
							hasFilters ? (
								<Button type="button" tone="neutral" buttonStyle="outline" onClick={clearFilters}>
									{copy.clearFilters}
								</Button>
							) : undefined
						}
					/>
				)
			)
		}

		if (view === "table" || view === "list") {
			const View = view === "table" ? MediaLibraryTable : MediaLibraryList
			return (
				<View
					collections={collections}
					items={visibleItems}
					selectedSet={selectedSet}
					selectionMode={selectionMode}
					accessors={accessors}
					strings={copy}
					onToggle={handleToggle}
					onDetails={setDetailId}
				/>
			)
		}

		return <MediaLibraryGrid items={visibleItems} selectedSet={selectedSet} selectionMode={selectionMode} accessors={accessors} strings={copy} onToggle={handleToggle} onDetails={setDetailId} density={density} showMeta={showMeta} renderItem={slots?.renderItem} />
	})()

	const browse = (
		<div className={styles.browse}>
			<MediaLibraryToolbar
				query={query}
				onQueryChange={setQuery}
				type={type}
				onTypeChange={setType}
				typeFilters={typeFilters}
				collection={collection}
				onCollectionChange={setCollection}
				collections={collections}
				sort={sort}
				onSortChange={setSort}
				view={view}
				onViewChange={setView}
				hasFilters={hasFilters}
				onClearFilters={clearFilters}
				strings={copy}
				end={slots?.toolbarEnd}
			/>
			<MediaLibrarySelectionBar visibleCount={filteredCount} totalCount={totalCount}
                selectedVisibleCount={visibleItems.filter((item) => selectedSet.has(accessors.getId(item))).length}
                onSelectVisible={selectionMode === "multiple" ? library.selectVisible : undefined}
                onDeselectVisible={selectionMode === "multiple" ? library.deselectVisible : undefined}
                disabled={loading}
                status={loading ? copy.loading : undefined} strings={copy} />
            {fetchError && visibleItems.length > 0 ? <Alert tone="warning" role="alert">
                <AlertDescription>{copy.refreshError}</AlertDescription>
                <AlertAction><Button tone="neutral" buttonStyle="outline" onClick={refetch}>{copy.retry}</Button></AlertAction>
            </Alert> : null}

			<div className={styles.workspace} data-detail={detailItem ? "" : undefined}>
				<div className={cx("media-library--results", styles.results)} aria-busy={loading}>{body}</div>
				{!!detailItem && (
					<MediaLibraryDetailPanel
						key={detailId}
						item={detailItem}
						collections={collections}
						accessors={accessors}
						strings={copy}
						onClose={() => setDetailId(null)}
						onUpdate={(patch) => library.updateItem(detailItem, patch)}
						onRemove={() => library.removeItem(detailItem)}
						renderDetail={slots?.renderDetail}
					/>
				)}
			</div>
		</div>
	)

	return (
		<section
			{...sectionProps}
			data-slot="media-library"
			className={cx("media-library--component", styles.root, className)}
		>
			{!!(title || description || slots?.headerStart || slots?.headerEnd) && (
				<header className={styles.header}>
					{slots?.headerStart}
					{!!(title || description || slots?.headerEnd) && (
						<ContentBlock
							surface="plain"
							title={title || undefined}
							description={description || undefined}
							headerEnd={slots?.headerEnd}
						/>
					)}
				</header>
			)}

			{allowUpload && onUpload ? (
				<Tabs
					value={tab}
					onValueChange={(next) => setTab(next as "library" | "upload")}
					className={styles.libraryTabs}
				>
					<TabList className={styles.libraryTabList}>
						<Tab value="library">{copy.tabs.library}</Tab>
						<Tab value="upload">{copy.tabs.upload}</Tab>
					</TabList>
					<TabPanel value="library" className={styles.libraryTabPanel}>
						{browse}
					</TabPanel>
					<TabPanel value="upload" className={styles.libraryTabPanel}>
						<MediaLibraryUploadPanel
							stagedFiles={library.stagedFiles}
							uploading={library.uploading}
							uploadOptions={library.uploadOptions}
							collections={collections}
							strings={copy}
							onAddFiles={library.addFiles}
							onRemoveFile={library.removeStagedFile}
							onClear={library.clearStagedFiles}
							onOptionsChange={library.updateUploadOptions}
							onStart={() => void library.startUpload()}
							onCancel={library.cancelUpload}
							empty={slots?.uploadEmpty}
							showActions={!hasPickerFooter}
						/>
					</TabPanel>
				</Tabs>
			) : (
				browse
			)}

			{slots?.footer}

			{/* The batch bar is for browsing only; the picker footer already reports the selection. */}
			{!!bulkActions && !hasPickerFooter && (
				<BatchActionBar
					selectedCount={selectedIds.length}
					totalCount={totalCount}
					onClear={clearSelection}
					strings={{ summary: (count) => copy.selectedCount(count), clear: copy.clearSelection }}
				>
					{bulkActions({
						selectedItems,
						selectedIds,
						selectedCount: selectedIds.length,
						visibleCount: filteredCount,
						totalCount,
						clearSelection,
					})}
				</BatchActionBar>
			)}

			{/* No footer when picking confirms. */}
			{hasPickerFooter && (
				<MediaLibraryFooter<TItem>
					tab={tab}
					selectedItems={selectedItems}
					selectedIds={selectedIds}
					selectionMode={selectionMode}
					stagedFiles={library.stagedFiles}
					uploading={library.uploading}
					strings={copy}
					visibleCount={filteredCount}
					totalCount={totalCount}
					confirmLabel={confirmLabel}
					cancelLabel={cancelLabel}
					onClearSelection={selectedIds.length > 0 ? clearSelection : undefined}
					onCancel={() => {
						onCancel?.()
						onClose?.()
					}}
					onConfirm={() => {
						onConfirm(selectedItems, selectedIds)
						onClose?.()
					}}
					onUpload={() => void library.startUpload()}
					onCancelUpload={() => { if (library.uploading) library.cancelUpload(); else { onCancel?.(); onClose?.() } }}
				/>
			)}
		</section>
	)
}

/** The same library in a modal, for picking assets from elsewhere on a page. */
export function MediaLibraryDialog<TItem = MediaLibraryItem>({
	open,
	onOpenChange,
	trigger,
	dialogTitle,
	dialogDescription,
	dialogClassName,
	contentClassName,
	closeOnEscape,
	closeOnBackdropClick,
	onClose,
	strings,
	...props
}: MediaLibraryDialogProps<TItem>) {
	const copy = resolveStrings(defaultMediaLibraryStrings, strings)

	return (
		<ActionDialog
			open={open}
			onOpenChange={onOpenChange}
			trigger={trigger}
			title={dialogTitle ?? copy.title}
			description={dialogDescription ?? copy.description}
			width="xl"
			closeOnEscape={closeOnEscape}
			closeOnBackdropClick={closeOnBackdropClick}
			/* The library draws its own footer. */
			showCancel={false}
			showConfirm={false}
			className={cx("media-library-dialog--component", dialogClassName)}
			contentClassName={contentClassName}
		>
			<MediaLibrary<TItem>
				{...props}
				strings={strings}
				onClose={() => {
					onClose?.()
					onOpenChange?.(false)
				}}
			/>
		</ActionDialog>
	)
}
