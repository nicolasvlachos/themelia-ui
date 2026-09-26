import { useEffect, useRef, useState } from "react"
import { Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Select, ToggleField } from "@/components/base/choice-inputs"
import { MetadataList } from "@/components/base/display"
import { Alert, AlertDescription } from "@/components/base/feedback"
import { FormField } from "@/components/base/forms"
import { Textarea } from "@/components/base/text-inputs"
import { TagsInput } from "@/components/base/value-inputs"
import { Text } from "@/components/base/typography"
import { FileSize } from "@/components/primitives"
import { cx } from "@/lib/cx"
import { resolveStrings } from "@/lib/strings"

import { MediaPreview } from "./media-preview"
import { defaultMediaLibraryStrings, type MediaLibraryStrings } from "./media-library.strings"
import type { MediaLibraryCollectionOption, MediaLibraryItemPatch, MediaLibrarySlots, ResolvedMediaLibraryAccessors } from "./media-library.types"
import { getMediaLibraryDimensions } from "./use-media-library"
import styles from "./media-library.module.css"

export interface MediaLibraryDetailPanelProps<TItem> {
	item: TItem | null
	collections?: readonly MediaLibraryCollectionOption[]
	accessors: ResolvedMediaLibraryAccessors<TItem>
	strings: MediaLibraryStrings
	onClose: () => void
	onUpdate: (patch: MediaLibraryItemPatch) => Promise<boolean>
	onRemove: () => Promise<boolean>
	renderDetail?: MediaLibrarySlots<TItem>["renderDetail"]
}

export function MediaLibraryDetailPanel<TItem>({ item, collections = [], accessors, strings, onClose, onUpdate, onRemove, renderDetail }: MediaLibraryDetailPanelProps<TItem>) {
	const copy = resolveStrings(defaultMediaLibraryStrings, strings)
	const readDraft = () => ({ alt: item ? accessors.getAlt(item) ?? "" : "", collection: item ? accessors.getCollection(item) ?? "" : "", tags: item ? accessors.getTags(item) : [], public: item ? accessors.getPublic(item) ?? false : false })
	const id = item ? accessors.getId(item) : null
	const [draft, setDraft] = useState(readDraft)
	const [seededId, setSeededId] = useState(id)
	const [pending, setPending] = useState<"save" | "delete" | null>(null)
	const [feedback, setFeedback] = useState<"saved" | "saveFailed" | "deleteFailed" | null>(null)
	const active = useRef(true)
	const operation = useRef<symbol | null>(null)
	const panel = useRef<HTMLElement>(null)
	useEffect(() => {
		const trigger = document.activeElement
		panel.current?.focus({ preventScroll: true })
		panel.current?.scrollIntoView?.({ block: "start", behavior: "instant" })
		return () => { if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus() }
	}, [id])
	useEffect(() => {
		active.current = true
		return () => { active.current = false; operation.current = null }
	}, [id])
	if (id !== seededId) {
		setSeededId(id)
		setDraft(readDraft())
		setPending(null)
		setFeedback(null)
	}
	if (!item) return null
	const source = readDraft()
	const dirty = JSON.stringify(source) !== JSON.stringify(draft)
	const updateDraft = (patch: Partial<typeof draft>) => { setDraft((value) => ({ ...value, ...patch })); setFeedback(null) }
	const run = async (kind: "save" | "delete") => {
		if (operation.current) return
		const token = Symbol(kind)
		operation.current = token
		setPending(kind)
		setFeedback(null)
		try {
			const ok = kind === "save" ? await onUpdate({ ...draft, collection: draft.collection || undefined }) : await onRemove()
			if (!active.current || operation.current !== token) return
			if (!ok) setFeedback(kind === "save" ? "saveFailed" : "deleteFailed")
			else if (kind === "delete") onClose()
			else setFeedback("saved")
		} catch {
			if (active.current && operation.current === token) setFeedback(kind === "save" ? "saveFailed" : "deleteFailed")
		} finally {
			if (active.current && operation.current === token) { operation.current = null; setPending(null) }
		}
	}
	const name = accessors.getName(item)
	return <aside ref={panel} tabIndex={-1} onKeyDown={(event) => { if (event.key === "Escape" && !event.defaultPrevented) { event.stopPropagation(); onClose() } }} aria-label={name} data-slot="media-library-detail" className={cx("media-library-detail-panel--component", "media-library-detail--component", styles.detail)}>
		{renderDetail ? renderDetail(item, { accessors, update: onUpdate, remove: onRemove, close: onClose }) : <>
			<div className={styles.detailHeader}>
				<Text weight="semibold" truncate title={name}>{name}</Text>
				<Button tone="neutral" buttonStyle="ghost" iconOnly aria-label={copy.close} onClick={onClose}><XIcon /></Button>
			</div>
			<div className={styles.detailBody}>
				<MediaPreview item={item} accessors={accessors} className={styles.detailPreview} />
				{/* Every value goes through the list's own value path (no render props), so the facts share one size and ink. */}
				<MetadataList layout="rows" columns={1} items={[
					{ id: "type", label: copy.detail.type, value: copy.types[accessors.getType(item)] },
					{ id: "size", label: copy.detail.size, value: accessors.getSize(item) === undefined ? undefined : { value: accessors.getSize(item)!, display: <FileSize value={accessors.getSize(item)} size="inherit" type="inherit" /> } },
					{ id: "dimensions", label: copy.detail.dimensions, value: getMediaLibraryDimensions(item, accessors) || undefined },
					{ id: "uploaded", label: copy.detail.uploaded, value: accessors.getUploadedAt(item) === undefined ? undefined : { kind: "date", value: accessors.getUploadedAt(item)! } },
					{ id: "usage", label: copy.table.usage, value: accessors.getUsageCount(item) },
				]} />
				{accessors.getType(item) === "image" && <FormField label={copy.detail.altLabel}>
					<Textarea value={draft.alt} rows={2} disabled={!!pending} placeholder={copy.detail.altPlaceholder} onChange={(event) => updateDraft({ alt: event.target.value })} />
				</FormField>}
				{collections.length > 0 && <FormField label={copy.detail.collectionLabel}>
					<Select value={draft.collection} disabled={!!pending} options={collections.map((entry) => ({ value: entry.value, label: typeof entry.label === "string" ? entry.label : entry.value }))} onValueChange={(value) => updateDraft({ collection: value ?? "" })} />
				</FormField>}
				<FormField label={copy.detail.tagsLabel}><TagsInput value={draft.tags} disabled={!!pending} onValueChange={(tags) => updateDraft({ tags })} placeholder={copy.detail.tagsPlaceholder} /></FormField>
				<ToggleField label={copy.detail.publicLabel} description={copy.detail.publicDescription} disabled={!!pending} value={draft.public} onValueChange={(value) => updateDraft({ public: value })} />
				{feedback === "saveFailed" || feedback === "deleteFailed" ? <Alert tone="destructive" role="alert"><AlertDescription>{copy.detail[feedback]}</AlertDescription></Alert> :
					<Text size="xs" type="secondary" role="status">{pending ? (pending === "save" ? copy.detail.saving : copy.detail.deleting) : feedback === "saved" ? copy.detail.saved : dirty ? copy.detail.unsaved : null}</Text>}
			</div>
			<div className={styles.detailFooter}>
				<Button tone="destructive" buttonStyle="ghost" loading={pending === "delete"} disabled={!!pending} onClick={() => void run("delete")}><Trash2Icon />{copy.detail.delete}</Button>
				{dirty && <Button tone="neutral" buttonStyle="ghost" disabled={!!pending} onClick={() => { setDraft(source); setFeedback(null) }}>{copy.detail.reset}</Button>}
				<Button loading={pending === "save"} disabled={!!pending} onClick={() => void run("save")}>{copy.detail.save}</Button>
			</div>
		</>}
	</aside>
}
