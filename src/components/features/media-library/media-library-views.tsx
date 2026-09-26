import type { ReactNode } from "react"

import { Checkbox } from "@/components/base/choice-inputs"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { resolveStrings } from "@/lib/strings"

import { MediaLibraryCard, type MediaLibraryListProps } from "./media-library-parts"
import { defaultMediaLibraryStrings, type MediaLibraryStrings } from "./media-library.strings"
import type { MediaLibraryDensity, MediaLibrarySlots } from "./media-library.types"
import styles from "./media-library.module.css"

export interface MediaLibraryGridProps<TItem> extends MediaLibraryListProps<TItem> {
	density?: MediaLibraryDensity
	showMeta?: boolean
	renderItem?: MediaLibrarySlots<TItem>["renderItem"]
	className?: string
}

export function MediaLibraryGrid<TItem>({ items, selectedSet, accessors, strings, onToggle, onDetails, density = "comfortable", selectionMode = "multiple", showMeta = true, renderItem, className }: MediaLibraryGridProps<TItem>) {
	return <div data-media-density={density} className={cx("media-library-grid--component", styles.grid, className)}>
		{items.map((item) => {
			const id = accessors.getId(item)
			const selected = selectedSet.has(id)
			const toggle = () => onToggle(id)
			const openDetails = () => onDetails(id)
			return renderItem ? <div key={id}>{renderItem(item, { id, selected, accessors, selectionMode, toggle, openDetails })}</div> :
				<MediaLibraryCard key={id} item={item} selected={selected} density={density} selectionMode={selectionMode} showMeta={showMeta} accessors={accessors} strings={strings} onToggle={toggle} onDetails={openDetails} />
		})}
	</div>
}

export interface MediaLibrarySelectionBarProps {
	visibleCount: number
	totalCount: number
	selectedVisibleCount: number
	onSelectVisible?: () => void
	onDeselectVisible?: () => void
	status?: ReactNode
	disabled?: boolean
	strings?: Partial<MediaLibraryStrings>
	className?: string
}

export function MediaLibrarySelectionBar({ visibleCount, totalCount, selectedVisibleCount, onSelectVisible, onDeselectVisible, status, disabled, strings, className }: MediaLibrarySelectionBarProps) {
	const copy = resolveStrings(defaultMediaLibraryStrings, strings)
	const allSelected = visibleCount > 0 && selectedVisibleCount === visibleCount
	return <div className={cx("media-library-selection-bar--component", styles.selectionBar, className)}>
		<Text size="xs" type="secondary" role="status" aria-live="polite" aria-atomic="true">{status ?? copy.showingCount(visibleCount, totalCount)}</Text>
		{onSelectVisible && onDeselectVisible && <Checkbox
			checked={allSelected}
			indeterminate={!allSelected && selectedVisibleCount > 0}
			disabled={disabled || visibleCount === 0}
			label={allSelected ? copy.deselectVisible : copy.selectVisible}
			onChange={() => allSelected ? onDeselectVisible() : onSelectVisible()}
		/>}
	</div>
}
