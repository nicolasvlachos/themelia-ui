import { Button } from "@/components/base/buttons"
import { Checkbox } from "@/components/base/choice-inputs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/base/table"
import { Text } from "@/components/base/typography"
import { DatePrimitive, FileSize, Number as NumberPrimitive, EmptyValue } from "@/components/primitives"
import { resolveStrings } from "@/lib/strings"
import { cx } from "@/lib/cx"

import { defaultMediaLibraryStrings } from "./media-library.strings"
import type { MediaLibraryCollectionOption } from "./media-library.types"
import type { MediaLibraryListProps } from "./media-library-parts"
import { MediaPreview } from "./media-preview"
import styles from "./media-library.module.css"

export interface MediaLibraryTableProps<TItem> extends MediaLibraryListProps<TItem> { className?: string; collections?: readonly MediaLibraryCollectionOption[] }

/** A metadata table for inspecting assets; selection and details remain separate controls. */
export function MediaLibraryTable<TItem>({ items, selectedSet, accessors, strings, onToggle, onDetails, className, collections = [] }: MediaLibraryTableProps<TItem>) {
	const copy = resolveStrings(defaultMediaLibraryStrings, strings)
	return <Table aria-label={copy.title} containerClassName={cx("media-library-table--component", styles.table, className)}>
		<TableHeader><TableRow>
			<TableHead><Text tag="span" className="sr-only">{copy.select}</Text></TableHead>
			<TableHead>{copy.table.name}</TableHead>
			<TableHead>{copy.detail.type}</TableHead>
			<TableHead>{copy.table.collection}</TableHead>
			<TableHead align="end">{copy.table.size}</TableHead>
			<TableHead>{copy.table.uploaded}</TableHead>
			<TableHead align="end">{copy.table.usage}</TableHead>
			<TableHead><Text tag="span" className="sr-only">{copy.table.actions}</Text></TableHead>
		</TableRow></TableHeader>
		<TableBody>{items.map((item) => {
			const id = accessors.getId(item)
			const name = accessors.getName(item)
			const selected = selectedSet.has(id)
			return <TableRow key={id} data-state={selected ? "selected" : undefined} data-selected={selected || undefined}>
				<TableCell><Checkbox checked={selected} aria-label={copy.assetAction(selected ? copy.deselect : copy.select, name)} onChange={() => onToggle(id)} /></TableCell>
				<TableCell><Button tone="neutral" buttonStyle="ghost" onClick={(event) => { event.currentTarget.focus(); onDetails(id) }} className={styles.tableName}>
					<MediaPreview item={item} accessors={accessors} className={styles.rowPreview} />
					<Text tag="span" truncate title={name}>{name}</Text>
				</Button></TableCell>
				<TableCell><Text type="secondary">{copy.types[accessors.getType(item)]}</Text></TableCell>
				<TableCell><Text>{collections.find((option) => option.value === accessors.getCollection(item))?.label ?? (accessors.getCollection(item) || <EmptyValue />)}</Text></TableCell>
				<TableCell align="end"><FileSize value={accessors.getSize(item)} /></TableCell>
				<TableCell><DatePrimitive value={accessors.getUploadedAt(item)} /></TableCell>
				<TableCell align="end"><NumberPrimitive value={accessors.getUsageCount(item)} /></TableCell>
				<TableCell><Button tone="neutral" buttonStyle="ghost" aria-label={copy.assetAction(copy.details, name)} onClick={(event) => { event.currentTarget.focus(); onDetails(id) }}>{copy.details}</Button></TableCell>
			</TableRow>
		})}</TableBody>
	</Table>
}
