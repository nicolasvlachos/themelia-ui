/**
 * MediaResourceGallery: the assets attached to one record, in order. Not a browser: its
 * verbs are reorder, promote to cover and detach; `onAdd` usually opens the library dialog.
 * Reordering uses move buttons rather than drag, so it works with keyboard, screen reader
 * and touch.
 */
import { resolveStrings } from "@/lib/strings"
import {
	ChevronLeftIcon, ChevronRightIcon, PlusIcon, StarIcon, XIcon,
} from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { Empty } from "@/components/base/feedback"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { MediaPreview } from "./media-library-parts"
import { defaultMediaLibraryStrings } from "./media-library.strings"
import { resolveMediaLibraryAccessors } from "./use-media-library"
import type { MediaLibraryItem, MediaResourceGalleryProps } from "./media-library.types"
import styles from "./media-library.module.css"

export function MediaResourceGallery<TItem = MediaLibraryItem>({
	items,
	accessors: accessorsProp,
	title,
	description,
	primaryId,
	onPrimaryChange,
	onRemove,
	onReorder,
	onAdd,
	maxItems,
	layout = "grid",
	density = "comfortable",
	readOnly = false,
	empty,
	action,
	renderItem,
	strings,
	className,
	...props
}: MediaResourceGalleryProps<TItem>) {
	const copy = resolveStrings(defaultMediaLibraryStrings, strings)
	const accessors = resolveMediaLibraryAccessors(accessorsProp)

	const atLimit = maxItems !== undefined && items.length >= maxItems
	const canAdd = !readOnly && !!onAdd && !atLimit

	const move = (from: number, to: number) => {
		if (to < 0 || to >= items.length) return
		const next = [...items]
		const [moved] = next.splice(from, 1)
		if (!moved) return
		next.splice(to, 0, moved)
		onReorder?.(next.map((item) => accessors.getId(item)), next)
	}

	return (
		<section
			data-slot="media-resource-gallery"
			className={cx("media-resource-gallery--component", styles.gallery, className)}
			{...props}
		>
			{!!(title || description || action || canAdd) && (
				<ContentBlock
					title={title || undefined}
					description={description || undefined}
					headerEnd={
						<div className={styles.galleryActions}>
							{action}
							{canAdd && (
								<Button type="button" tone="neutral" buttonStyle="outline" onClick={onAdd}>
									<PlusIcon />
									{copy.gallery.add}
								</Button>
							)}
							{/* Stated rather than hidden: a silently vanishing add control reads as a bug. */}
							{atLimit && maxItems !== undefined && (
								<Text size="xs" type="secondary">{copy.gallery.limitReached(maxItems)}</Text>
							)}
						</div>
					}
				/>
			)}

			{items.length === 0 ? (
				(empty ?? (
					<Empty
						title={copy.gallery.emptyTitle}
						description={copy.gallery.emptyDescription}
						padding="md"
						border
						action={
							canAdd ? (
								<Button type="button" tone="neutral" buttonStyle="outline" onClick={onAdd}>
									{copy.gallery.add}
								</Button>
							) : undefined
						}
					/>
				))
			) : (
				<ul data-layout={layout} data-media-density={density} className={styles.galleryList}>
					{items.map((item, index) => {
						const id = accessors.getId(item)
						const primary = id === primaryId
						const context = {
							id,
							index,
							total: items.length,
							primary,
							accessors,
							canMovePrevious: index > 0,
							canMoveNext: index < items.length - 1,
							setPrimary: () => onPrimaryChange?.(id, item),
							remove: () => onRemove?.(id, item),
							movePrevious: () => move(index, index - 1),
							moveNext: () => move(index, index + 1),
						}

						if (renderItem) return <li key={id}>{renderItem(item, context)}</li>

						return (
							<li key={id} data-primary={primary || undefined} className={styles.galleryItem}>
								<MediaPreview item={item} accessors={accessors} className={styles.galleryPreview} />

								{primary && (
									<Badge tone="primary" className={styles.galleryBadge}>
										{copy.gallery.primary}
									</Badge>
								)}

								{!readOnly && (
									<div className={styles.galleryControls}>
										{!!onReorder && (
											<>
												<Button
													type="button"
													tone="neutral"
													buttonStyle="ghost"
													iconOnly
													aria-label={copy.gallery.moveEarlier}
													disabled={!context.canMovePrevious}
													onClick={context.movePrevious}
												>
													<ChevronLeftIcon />
												</Button>
												<Button
													type="button"
													tone="neutral"
													buttonStyle="ghost"
													iconOnly
													aria-label={copy.gallery.moveLater}
													disabled={!context.canMoveNext}
													onClick={context.moveNext}
												>
													<ChevronRightIcon />
												</Button>
											</>
										)}

										{!!onPrimaryChange && !primary && (
											<Button
												type="button"
												tone="neutral"
												buttonStyle="ghost"
												iconOnly
												aria-label={copy.gallery.makePrimary}
												onClick={context.setPrimary}
											>
												<StarIcon />
											</Button>
										)}

										{!!onRemove && (
											<Button
												type="button"
												tone="neutral"
												buttonStyle="ghost"
												iconOnly
												aria-label={`${copy.gallery.remove}: ${accessors.getName(item)}`}
												onClick={context.remove}
											>
												<XIcon />
											</Button>
										)}
									</div>
								)}
							</li>
						)
					})}
				</ul>
			)}
		</section>
	)
}
