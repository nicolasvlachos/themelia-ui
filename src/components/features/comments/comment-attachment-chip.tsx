/**
 * CommentAttachmentChip — one file, in a composer draft or on a posted comment. Staged,
 * uploading, failed and uploaded share one row shape, so finishing an upload never reflows.
 */
import type { ComponentType } from "react"
import {
	FileIcon, FileTextIcon, ImageIcon, PaperclipIcon, XIcon,
} from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Spinner } from "@/components/base/spinner"
import { Text } from "@/components/base/typography"
import { FileSize, Percent, SecondaryValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultCommentsStrings, type CommentsStrings } from "./comments.strings"
import type { CommentAttachment, CommentsAccessors } from "./comments.types"
import styles from "./comments.module.css"

export interface CommentAttachmentChipProps {
	attachment: CommentAttachment
	/** Reveals the remove control. */
	editable?: boolean
	onRemove?: (id: string) => void
	onRetry?: (id: string) => void
	accessors?: CommentsAccessors
	strings?: Partial<CommentsStrings>
	className?: string
}

/** The glyph per file kind, as a module-level map so the chosen component is stable across renders. */
const KIND_ICONS: Record<string, ComponentType<{ className?: string }>> = {
	image: ImageIcon,
	document: FileTextIcon,
	file: FileIcon,
	unknown: PaperclipIcon,
}

function iconKind(mimeType: string | undefined): keyof typeof KIND_ICONS {
	// No mime type at all means the file arrived without one, not that it is unusual.
	if (!mimeType) return "unknown"
	if (mimeType.startsWith("image/")) return "image"
	if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return "document"
	return "file"
}

function AttachmentIcon({ mimeType, className }: { mimeType?: string; className?: string }) {
	const Icon = KIND_ICONS[iconKind(mimeType)]!
	return <Icon className={className} />
}

export function CommentAttachmentChip({
	attachment,
	editable = false,
	onRemove,
	onRetry,
	accessors,
	strings,
	className,
}: CommentAttachmentChipProps) {
	const copy = { ...defaultCommentsStrings, ...strings }

	const url = accessors?.getMediaUrl?.(attachment) ?? attachment.url
	const name = accessors?.getMediaName?.(attachment) ?? attachment.name ?? copy.attachmentFallback

	const uploading = attachment.status === "uploading"
	const failed = attachment.status === "failed"

	/* The trailing text: progress, size, or the uploader's own error message when it gave one. */
	const meta = uploading ? (
		<SecondaryValue size="xs" className={styles.chipMeta}>
			{copy.attachmentUploadingLabel}
			{typeof attachment.progress === "number" && (
				<>
					{" "}
					<Percent value={Math.round(attachment.progress)} scaled size="xs" type="secondary" />
				</>
			)}
		</SecondaryValue>
	) : failed ? (
		<SecondaryValue size="xs" className={styles.chipMeta}>
			{attachment.error ?? copy.attachmentFailedLabel}
		</SecondaryValue>
	) : typeof attachment.size === "number" ? (
		<FileSize value={attachment.size} size="xs" type="secondary" className={styles.chipMeta} />
	) : null

	const label = (
		<span className={styles.chipLabel}>
			<Text tag="span" size="xs" weight="medium" type={failed ? "error" : "main"} truncate>
				{name}
			</Text>
			{meta}
		</span>
	)

	// Only a finished upload has somewhere to go.
	const linkable = !!url && !uploading && !failed

	return (
		<div data-slot="comment-attachment" data-status={attachment.status} className={cx("comment-attachment-chip--component", styles.chip, className)}>
			{uploading ? <Spinner /> : <AttachmentIcon mimeType={attachment.mimeType} className={styles.chipIcon} />}

			{linkable ? (
				<a
					href={url}
					target="_blank"
					rel="noreferrer noopener"
					aria-label={copy.attachmentDownloadLabel}
					className={styles.chipLink}
				>
					{label}
				</a>
			) : (
				label
			)}

			{/* A hairline along the bottom edge — progress without a second row. */}
			{uploading && typeof attachment.progress === "number" && (
				<div className={styles.chipProgress}>
					<div
						className={styles.chipProgressFill}
						style={{ width: `${Math.min(100, Math.max(0, attachment.progress))}%` }}
					/>
				</div>
			)}

			{failed && !!onRetry && (
				<Button
					type="button"
					tone="destructive"
					buttonStyle="ghost"
					onClick={() => onRetry(attachment.id)}
					className={styles.chipRetry}
				>
					{copy.attachmentRetryLabel}
				</Button>
			)}

			{editable && !!onRemove && (
				<Button
					type="button"
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					onClick={() => onRemove(attachment.id)}
					aria-label={copy.attachmentRemoveLabel}
					title={copy.attachmentRemoveLabel}
					className={styles.chipRemove}
				>
					<XIcon />
				</Button>
			)}
		</div>
	)
}
