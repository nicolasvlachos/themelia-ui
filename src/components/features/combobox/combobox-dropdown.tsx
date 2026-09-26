/**
 * The popup: the status row, the results, the create row, the pager, and the footer.
 * Rows, groups and captions are the base combobox's own.
 *
 * With nothing to show, the popup stays mounted and collapses (`data-empty`): unmounting
 * loses the positioner, and the next open animates in from the wrong place.
 */
import type { ReactNode, RefObject } from "react"

import {
	ComboboxCollection, ComboboxGroup, ComboboxGroupLabel, ComboboxItem,
	ComboboxList, ComboboxPopup, ComboboxPortal, ComboboxPositioner, ComboboxStatus,
} from "@/components/base/combobox"
import { Button } from "@/components/base/buttons"
import { ScrollArea } from "@/components/base/display"
import { Spinner } from "@/components/base/spinner"
import { Text } from "@/components/base/typography"

import type { AsyncComboboxStrings } from "./combobox.strings"
import styles from "./combobox.module.css"

/** What the status row says, given how far the reader has got. */
function StatusContent({
	loading,
	trimmedSearch,
	minSearchLength,
	strings,
}: {
	loading?: boolean
	trimmedSearch: string
	minSearchLength: number
	strings: AsyncComboboxStrings
}): ReactNode {
	if (loading) {
		return <Spinner label={strings.searching} />
	}

	if (trimmedSearch === "") {
		return <Text size="xs" type="secondary">{strings.formatTypeToSearch(minSearchLength)}</Text>
	}

	if (trimmedSearch.length < minSearchLength) {
		return (
			<Text size="xs" type="secondary">
				{strings.formatTypeMore(minSearchLength - trimmedSearch.length)}
			</Text>
		)
	}

	// At or above the threshold and not loading: the list itself is the answer.
	return null
}

export interface ComboboxDropdownProps<T> {
	loading: boolean
	showStatus: boolean
	showEmpty: boolean
	trimmedSearch: string
	minSearchLength: number
	items: T[]
	groupedItems: Map<string, T[]> | null
	createOptionItem: T | null
	renderItemContent: (item: T) => ReactNode
	getItemReactKey: (item: T) => string
	getItemDisabled?: (item: T) => boolean
	renderGroupLabel?: (group: string) => ReactNode
	loadingMore?: boolean
	strings: AsyncComboboxStrings
	portalContainer?: RefObject<HTMLElement | null>
	/** The scrollable viewport, watched for pagination. */
	listRef: RefObject<HTMLDivElement | null>
	/** What the popup positions against. The chips row, for a multi-select. */
	anchor?: RefObject<HTMLElement | null>
	applyFooter?: {
		applyLabel: string
		cancelLabel: string
		onApply: () => void
		onCancel: () => void
	}
	/** Error content, shown instead of everything else. */
	errorSlot?: ReactNode
}

export function ComboboxDropdown<T>({
	loading,
	showStatus,
	showEmpty,
	trimmedSearch,
	minSearchLength,
	items,
	groupedItems,
	createOptionItem,
	renderItemContent,
	getItemReactKey,
	getItemDisabled,
	renderGroupLabel,
	loadingMore,
	strings,
	portalContainer,
	listRef,
	anchor,
	applyFooter,
	errorSlot,
}: ComboboxDropdownProps<T>) {
	const hasContent =
		!!errorSlot || showStatus || showEmpty || items.length > 0 || !!loadingMore || !!applyFooter

	const renderOption = (item: T) => (
		<ComboboxItem
			key={getItemReactKey(item)}
			value={item}
			disabled={getItemDisabled?.(item)}
		>
			{renderItemContent(item)}
		</ComboboxItem>
	)

	const content = (
		<ComboboxPositioner anchor={anchor} className={portalContainer ? styles.positioner : undefined}>
			<ComboboxPopup
				aria-busy={loading || undefined}
				// Collapsed rather than unmounted — see the note above.
				data-empty={!hasContent || undefined}
				className={styles.popup}
			>
				{errorSlot ?? (
					<>
						{showStatus && (
							<ComboboxStatus className={styles.status}>
								<StatusContent
									loading={loading}
									trimmedSearch={trimmedSearch}
									minSearchLength={minSearchLength}
									strings={strings}
								/>
							</ComboboxStatus>
						)}

						{showEmpty && (
							<ComboboxStatus className={styles.empty}>
								<Text type="secondary">{strings.noResults}</Text>
							</ComboboxStatus>
						)}

						{/* The scroller IS the paginated element, so the ref lands here. */}
						<ScrollArea ref={listRef} className={styles.scroller}>
							<ComboboxList className={styles.list}>
								{groupedItems ? (
									<>
										{Array.from(groupedItems.entries()).map(([group, groupItems]) => (
											<ComboboxGroup key={group} items={groupItems}>
												{/* The caption as given; the group label part owns its size and ink. */}
												<ComboboxGroupLabel>
													{renderGroupLabel ? renderGroupLabel(group) : group}
												</ComboboxGroupLabel>
												<ComboboxCollection>{renderOption}</ComboboxCollection>
											</ComboboxGroup>
										))}

										{/* Outside the groups: a new thing belongs to none of them. */}
										{createOptionItem !== null && renderOption(createOptionItem)}
									</>
								) : (
									<ComboboxCollection>{renderOption}</ComboboxCollection>
								)}
							</ComboboxList>
						</ScrollArea>

						{!!loadingMore && (
							<div role="status" aria-live="polite" className={styles.loadingMore}>
								<Spinner label={strings.loadingMore} />
							</div>
						)}

						{!!applyFooter && (
							<div className={styles.footer}>
								<Button
									type="button"
									tone="neutral"
									buttonStyle="ghost"
									/* Prevented: inside a listbox the press would select the option under the pointer. */
									onClick={(event) => {
										event.preventDefault()
										event.stopPropagation()
										applyFooter.onCancel()
									}}
								>
									{applyFooter.cancelLabel}
								</Button>
								<Button
									type="button"
									onClick={(event) => {
										event.preventDefault()
										event.stopPropagation()
										applyFooter.onApply()
									}}
								>
									{applyFooter.applyLabel}
								</Button>
							</div>
						)}
					</>
				)}
			</ComboboxPopup>
		</ComboboxPositioner>
	)

	return <ComboboxPortal container={portalContainer}>{content}</ComboboxPortal>
}
