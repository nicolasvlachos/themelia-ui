/**
 * UploadProgressList and UploadTray — transfers in progress. Neither transfers anything:
 * the caller sends the files and feeds status and progress back through `items`.
 */
import { resolveStrings } from "@/lib/strings"
import {
	CheckIcon, CircleAlertIcon, ClockIcon, FileIcon, Loader2Icon, RotateCwIcon, XIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { VisuallyHidden } from "@/components/base/display"
import { FileSize } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { PreviewImage } from "./preview-image"

import { FileUpload, type FileUploadProps } from "./file-upload"
import {
	defaultUploadProgressListStrings, defaultUploadTrayStrings,
	type UploadProgressListStrings, type UploadTrayStrings,
} from "./upload.strings"
import styles from "./upload.module.css"

export type UploadStatus = "queued" | "uploading" | "done" | "error" | "cancelled"

export interface UploadItem {
	/** Stable identity. The caller's, not a file name — two files may share one. */
	id: string
	name: string
	/** In bytes. Formatted for display here. */
	size?: number
	/** 0–100. Ignored unless the status is `uploading`. */
	progress?: number
	status: UploadStatus
	/** Shown under the row when the status is `error`. */
	error?: string
	/** A thumbnail, used in place of the status glyph. */
	preview?: string
}

const STATUS_ICON: Record<UploadStatus, ReactNode> = {
	queued: <ClockIcon aria-hidden />,
	uploading: <Loader2Icon aria-hidden />,
	done: <CheckIcon aria-hidden />,
	error: <CircleAlertIcon aria-hidden />,
	cancelled: <XIcon aria-hidden />,
}

const STATUS_CLASS: Record<UploadStatus, string> = {
	queued: styles.statusQueued,
	uploading: styles.statusUploading,
	done: styles.statusDone,
	error: styles.statusError,
	cancelled: styles.statusCancelled,
}

export interface UploadProgressListProps {
	items: UploadItem[]
	/** Overrides this list's own copy — the five status words and the row controls. */
	strings?: Partial<UploadProgressListStrings>
	/** Offered while a row is queued or uploading. */
	onCancel?: (id: string) => void
	/** Offered when a row has failed. */
	onRetry?: (id: string) => void
	/**
	 * Offered once a row is done, cancelled or failed, and on a queued row without
	 * `onCancel`. Never on a transfer in flight (that is cancel).
	 */
	onRemove?: (id: string) => void
	className?: string
}

export function UploadProgressList({
	items,
	onCancel,
	onRetry,
	onRemove,
	strings,
	className,
}: UploadProgressListProps) {
	const copy = resolveStrings(defaultUploadProgressListStrings, strings)

	// Only the end of a transfer is announced.
	const seen = useRef(new Map<string, UploadStatus>())
	const [announcement, setAnnouncement] = useState("")
	const active = items.some((item) => item.status === "queued" || item.status === "uploading")
	const [hasBeenActive, setHasBeenActive] = useState(active)
	// Derived during render, once: a list that has ever been in flight keeps its region.
	if (active && !hasBeenActive) setHasBeenActive(true)
	useEffect(() => {
		const settled: string[] = []
		for (const item of items) {
			const before = seen.current.get(item.id)
			const ended = item.status === "done" || item.status === "error" || item.status === "cancelled"
			if (before !== undefined && before !== item.status && ended) {
				settled.push(copy.settled?.(item.name, copy.status[item.status]) ?? `${item.name}: ${copy.status[item.status]}`)
			}
		}
		seen.current = new Map(items.map((item) => [item.id, item.status]))
		// oxlint-disable-next-line react/set-state-in-effect -- the announcement is a diff of two renders' statuses, which only exists after the new one commits
		if (settled.length > 0) setAnnouncement(settled.join(". "))
	}, [items, copy])

	if (items.length === 0) return null

	return (
		<>
			<ul className={cx("upload-progress-list--component", styles.list, className)}>
				{items.map((item) => {
					// Cancel while unfinished, remove once finished; a failed row offers retry and remove.
					const cancel = { key: "cancel", label: copy.cancel(item.name), icon: <XIcon />, run: () => onCancel?.(item.id) }
					const retry = { key: "retry", label: copy.retry(item.name), icon: <RotateCwIcon />, run: () => onRetry?.(item.id) }
					const removal = { key: "remove", label: copy.remove(item.name), icon: <XIcon />, run: () => onRemove?.(item.id) }
					const actions =
						item.status === "uploading"
							? onCancel ? [cancel] : []
							: item.status === "queued"
								? onCancel ? [cancel] : onRemove ? [removal] : []
								: item.status === "error"
									? [...(onRetry ? [retry] : []), ...(onRemove ? [removal] : [])]
									: onRemove ? [removal] : []

					return (
						<li key={item.id} className={styles.row}>
							{item.preview ? (
								<span className={styles.thumb}>
									<PreviewImage src={item.preview} fallback={<FileIcon aria-hidden />} />
								</span>
							) : (
								<span
									className={cx(styles.statusIcon, STATUS_CLASS[item.status])}
									// The glyph is decorative; the status is announced on the row.
									aria-hidden
								>
									{STATUS_ICON[item.status]}
								</span>
							)}

							<div className={styles.rowBody}>
								<span className={styles.rowName}>{item.name}</span>
								<span className={styles.rowMeta}>
									{copy.status[item.status]}
									{item.size !== undefined && (
										<>
											{" · "}
											<FileSize value={item.size} />
										</>
									)}
								</span>

								{item.status === "uploading" && (
									<div
										className={styles.progress}
										role="progressbar"
										aria-valuenow={item.progress ?? 0}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-label={copy.uploading(item.name)}
									>
										<div className={styles.progressFill} style={{ width: `${item.progress ?? 0}%` }} />
									</div>
								)}

								{item.status === "error" && !!item.error && (
									<span className={styles.rowError}>{item.error}</span>
								)}
							</div>

							{actions.length > 0 && (
								<span className={styles.rowActions}>
									{actions.map((action) => (
										<Button
											key={action.key}
											tone="neutral"
											buttonStyle="ghost"
											iconOnly
											/* The label already includes the file name. */
											aria-label={action.label}
											onClick={action.run}
										>
											{action.icon}
										</Button>
									))}
								</span>
							)}
						</li>
					)
				})}
			</ul>
			{/*
			  * Mounted once a transfer has been in flight, and kept: a live region must exist
			  * before its text arrives. `aria-live`, not `role="status"`, to avoid competing
			  * with a surrounding panel's status.
			  */}
			{hasBeenActive && <VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>}
		</>
	)
}

export interface UploadTrayProps extends Omit<FileUploadProps, "value" | "onValueChange" | "showList"> {
	/** Everything in the tray, at whatever stage. */
	items: UploadItem[]
	/** Fires when files are dropped or browsed; the caller adds them to `items` and starts the transfer. */
	onAddFiles: (files: File[]) => void
	onCancel?: (id: string) => void
	onRetry?: (id: string) => void
	onRemove?: (id: string) => void
	onClearAll?: () => void
	/** Overrides this tray's own copy — the clear-all control. */
	strings?: Partial<UploadTrayStrings>
	/** Hides the counts row. */
	showSummary?: boolean
}

export function UploadTray({
	items,
	onAddFiles,
	onCancel,
	onRetry,
	onRemove,
	onClearAll,
	strings,
	showSummary = true,
	className,
	...uploadProps
}: UploadTrayProps) {
	const copy = { ...defaultUploadTrayStrings, ...strings }
	const counts = useMemo(() => {
		const tally: Partial<Record<UploadStatus, number>> = {}
		for (const item of items) tally[item.status] = (tally[item.status] ?? 0) + 1
		return tally
	}, [items])

	/** Only the statuses actually present — a row of zeroes says nothing. */
	const summary = (["uploading", "queued", "done", "error", "cancelled"] as UploadStatus[])
		.filter((status) => counts[status])
		.map((status) => ({ status, count: counts[status] as number }))

	return (
		<div className={cx("upload-tray--component", styles.tray, className)}>
			{/* The tray's strings extend both children's. */}
			<FileUpload
				{...uploadProps}
				strings={strings}
				multiple
				showList={false}
				// The tray owns the list, so FileUpload must not keep one of its own.
				value={[]}
				onValueChange={(files) => {
					if (files.length > 0) onAddFiles(files)
				}}
			/>

			{showSummary && summary.length > 0 && (
				<div className={styles.trayToolbar}>
					<div className={styles.trayCounts}>
						{summary.map(({ status, count }) => (
							<Badge
								key={status}
								tone={status === "error" ? "destructive" : "neutral"}
							>
								{copy.status[status]} {count}
							</Badge>
						))}
					</div>
					{!!onClearAll && (
						<Button tone="neutral" buttonStyle="ghost" onClick={onClearAll}>
							{copy.clearAll}
						</Button>
					)}
				</div>
			)}

			<UploadProgressList items={items} strings={strings} onCancel={onCancel} onRetry={onRetry} onRemove={onRemove} />
		</div>
	)
}
