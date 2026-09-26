/**
 * The surfaces that carry what a model produced: code, an artifact wrapping it, the
 * sources it read, and the files attached to a turn. No syntax highlighting: bring a
 * highlighter and pass its output as `AiArtifact` children, or replace the code block.
 */
import { useMemo, useState } from "react"
import {
	AlertCircleIcon, ArchiveIcon, AudioLinesIcon, CheckIcon, ChevronDownIcon, CopyIcon,
	DownloadIcon, ExternalLinkIcon, FileCodeIcon, FileTextIcon, GlobeIcon, ImageIcon,
	VideoIcon, XIcon, type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/base/buttons"
import { useCopyToClipboard } from "@/components/base/copyable"
import { IconBadge } from "@/components/base/display"
import { PreviewImage } from "@/components/base/upload"
import { Text, TextLink } from "@/components/base/typography"
import { MonoValue, Number as NumberValue, SecondaryValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import {
	defaultAiArtifactStrings, defaultAiAttachmentStrings, defaultAiCodeBlockStrings,
	defaultAiSourcesStrings,
} from "./ai-chat.strings"
import type {
	AiArtifactProps, AiAttachmentKind, AiAttachmentProps, AiCodeBlockProps, AiSourceItem,
	AiSourcesProps,
} from "./ai-chat.types"
import styles from "./ai-chat.module.css"

/** How long "Copied" stays up. */
const COPIED_MS = 1500

export function AiCodeBlock({
	code,
	language,
	filename,
	showLineNumbers = false,
	highlightLines,
	hideHeader = false,
	maxHeight,
	headerActions,
	onCopy,
	className,
	strings,
}: AiCodeBlockProps) {
	const copy = { ...defaultAiCodeBlockStrings, ...strings }
	const { copied, copy: writeCopy } = useCopyToClipboard({ confirmMs: COPIED_MS, onCopy })

	const lines = useMemo(() => code.split("\n"), [code])
	const highlighted = useMemo(() => new Set(highlightLines ?? []), [highlightLines])

	return (
		<div className={cx("ai-code-block--component", styles.code, className)}>
			{!hideHeader && (
				<div className={styles.codeHeader}>
					{/* Caps for a language label only; a filename is case-sensitive. */}
					<MonoValue
						size="xs"
						data-caps={!filename || undefined}
						className={styles.codeLabel}
					>
						{filename || language || copy.defaultLanguageLabel}
					</MonoValue>
					{!!filename && !!language && (
						<MonoValue size="xs" type="secondary" className={styles.codeLanguage}>
							{language}
						</MonoValue>
					)}
					<div className={styles.codeActions}>
						{headerActions}
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							iconOnly
							aria-label={copy.copyAria}
							onClick={() => void writeCopy(code)}
						>
							{copied ? <CheckIcon className={styles.copiedIcon} /> : <CopyIcon />}
						</Button>
					</div>
				</div>
			)}

			{/* Focusable, because it scrolls in both axes. */}
			<div
				tabIndex={0}
				style={
					maxHeight === undefined
						? undefined
						: { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }
				}
				className={styles.codeScroll}
			>
				{showLineNumbers ? (
					<pre className={styles.codeNumbered}>
						{lines.map((line, index) => {
							const number = index + 1
							return (
								<span key={index} data-highlight={highlighted.has(number) || undefined}>
									<span aria-hidden className={styles.codeGutter}>{number}</span>
									<span className={styles.codeLine}>{line || " "}</span>
								</span>
							)
						})}
					</pre>
				) : (
					<pre className={styles.codePlain}>
						<code>{code}</code>
					</pre>
				)}
			</div>
		</div>
	)
}

export function AiArtifact({
	title,
	subtitle,
	icon = FileTextIcon,
	copyText,
	children,
	collapsed = false,
	onOpen,
	actions,
	onDownload,
	className,
	strings,
}: AiArtifactProps) {
	const copy = { ...defaultAiArtifactStrings, ...strings }
	const { copied, copy: writeCopy } = useCopyToClipboard({ confirmMs: COPIED_MS })

	return (
		<div className={cx("ai-artifact--component", styles.artifact, className)}>
			<div className={styles.artifactHeader}>
				<IconBadge icon={icon} tone="neutral" shape="rounded" />
				<div className={styles.artifactText}>
					<Text weight="semibold" truncate>{title}</Text>
					{!!subtitle && (
						<Text size="xs" type="secondary" truncate>{subtitle}</Text>
					)}
				</div>
				<div className={styles.artifactActions}>
					{actions?.map((action) => {
						const ActionIcon = action.icon
						return (
							<Button
								key={action.id}
								type="button"
								tone="neutral"
								buttonStyle="ghost"
								onClick={action.onSelect}
							>
								{!!ActionIcon && <ActionIcon />}
								{action.label}
							</Button>
						)
					})}
					{!!copyText && (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							iconOnly
							aria-label={copy.copyAria}
							onClick={() => void writeCopy(copyText)}
						>
							{copied ? <CheckIcon className={styles.copiedIcon} /> : <CopyIcon />}
						</Button>
					)}
					{!!onDownload && (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							iconOnly
							aria-label={copy.downloadAria}
							onClick={onDownload}
						>
							<DownloadIcon />
						</Button>
					)}
					{!!onOpen && (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							iconOnly
							aria-label={copy.openAria}
							onClick={onOpen}
						>
							<ExternalLinkIcon />
						</Button>
					)}
				</div>
			</div>

			{!collapsed && !!children && <div className={styles.artifactBody}>{children}</div>}
		</div>
	)
}

/** A favicon is a third party's file on a third party's host; it fails often. */
function SourceFavicon({ src }: { src?: string }) {
	const globe = <GlobeIcon aria-hidden className={styles.sourceGlobe} />
	if (!src) return globe

	return <PreviewImage src={src} fallback={globe} className={styles.sourceImage} />
}

function AvatarStack({
	sources,
	onSelect,
}: {
	sources: readonly AiSourceItem[]
	onSelect?: (source: AiSourceItem, index: number) => void
}) {
	return (
		<span aria-hidden className={styles.sourceStack}>
			{sources.map((source, index) => {
				const face = (
					<span
						title={typeof source.title === "string" ? source.title : undefined}
						className={styles.sourceFace}
					>
						<SourceFavicon src={source.faviconUrl} />
					</span>
				)

				return onSelect ? (
					<button
						key={source.id}
						type="button"
						onClick={() => onSelect(source, index)}
						className={styles.sourceFaceButton}
					>
						{face}
					</button>
				) : (
					<span key={source.id}>{face}</span>
				)
			})}
		</span>
	)
}

function SourceRow({
	source,
	index,
	onSelect,
	visitLabel,
}: {
	source: AiSourceItem
	index: number
	onSelect?: () => void
	visitLabel: string
}) {
	const body = (
		<>
			<NumberValue
				value={index}
				size="xs"
				weight="semibold"
				type="secondary"
				className={styles.sourceIndex}
			/>
			<span className={styles.sourceText}>
				<Text tag="span" weight="medium" truncate>
					{source.title}
					{!!source.url && <ExternalLinkIcon aria-hidden className={styles.sourceExternal} />}
				</Text>
				{!!source.publisher && (
					<Text tag="span" size="xs" type="secondary" truncate>
						{source.publisher}
					</Text>
				)}
				{!!source.snippet && (
					<Text tag="span" size="xs" type="secondary" className={styles.sourceSnippet}>
						{source.snippet}
					</Text>
				)}
			</span>
		</>
	)

	return (
		<li>
			{/* `onSelect` wins over `url`, for in-app routing. */}
			{onSelect ? (
				<button type="button" onClick={onSelect} className={styles.sourceRow}>
					{body}
				</button>
			) : source.url ? (
				<TextLink
					href={source.url}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={visitLabel}
					className={styles.sourceRow}
				>
					{body}
				</TextLink>
			) : (
				<div className={styles.sourceRow}>{body}</div>
			)}
		</li>
	)
}

export function AiSources({
	sources,
	variant = "list",
	maxAvatars = 5,
	expanded: expandedProp,
	defaultExpanded = false,
	onExpandedChange,
	onSelect,
	className,
	strings,
}: AiSourcesProps) {
	const copy = { ...defaultAiSourcesStrings, ...strings }

	const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
	const expanded = expandedProp ?? internalExpanded

	const setExpanded = (next: boolean) => {
		if (expandedProp === undefined) setInternalExpanded(next)
		onExpandedChange?.(next)
	}

	const title = copy.title.replace(/\{\{\s*count\s*\}\}/g, String(sources.length))

	if (variant === "avatars") {
		const visible = sources.slice(0, maxAvatars)
		const overflow = sources.length - visible.length

		return (
			<div className={cx("ai-sources--component", styles.sourceStrip, className)}>
				<AvatarStack sources={visible} onSelect={onSelect} />
				<Text tag="span" size="xs" type="secondary">{title}</Text>
				{overflow > 0 && (
					<SecondaryValue size="xs" className={styles.numeric}>
						+<NumberValue value={overflow} size="xs" type="secondary" />
					</SecondaryValue>
				)}
			</div>
		)
	}

	return (
		<div className={cx("ai-sources--component", styles.sources, className)}>
			<button
				type="button"
				aria-expanded={expanded}
				aria-label={expanded ? copy.collapse : copy.expand}
				onClick={() => setExpanded(!expanded)}
				className={styles.disclosureTrigger}
			>
				<AvatarStack sources={sources.slice(0, 4)} />
				<Text tag="span" weight="medium" className={styles.grow}>{title}</Text>
				<ChevronDownIcon
					aria-hidden
					data-expanded={expanded || undefined}
					className={styles.disclosureChevron}
				/>
			</button>

			{expanded && (
				<ol className={styles.sourceList}>
					{sources.map((source, index) => (
						<SourceRow
							key={source.id}
							source={source}
							index={index + 1}
							visitLabel={copy.visit}
							onSelect={onSelect ? () => onSelect(source, index) : undefined}
						/>
					))}
				</ol>
			)}
		</div>
	)
}

const KIND_ICON = {
	image: ImageIcon,
	document: FileTextIcon,
	audio: AudioLinesIcon,
	video: VideoIcon,
	code: FileCodeIcon,
	archive: ArchiveIcon,
	generic: FileTextIcon,
} satisfies Record<AiAttachmentKind, LucideIcon>

export function AiAttachment({
	name,
	meta,
	kind = "generic",
	icon,
	thumbnailUrl,
	progress,
	errored = false,
	onOpen,
	onRemove,
	className,
	strings,
}: AiAttachmentProps) {
	const copy = { ...defaultAiAttachmentStrings, ...strings }
	const Icon = icon ?? KIND_ICON[kind]

	/* An error replaces the progress bar. */
	const uploading = !errored && typeof progress === "number" && progress >= 0 && progress < 1
	const percent = Math.round((progress ?? 0) * 100)

	const body = (
		<>
			{thumbnailUrl ? (
				<span
					aria-hidden
					style={{ backgroundImage: `url(${thumbnailUrl})` }}
					className={styles.attachmentThumb}
				/>
			) : (
				<span aria-hidden data-errored={errored || undefined} className={styles.attachmentIcon}>
					{errored ? <AlertCircleIcon /> : <Icon />}
				</span>
			)}

			<span className={styles.attachmentText}>
				<Text tag="span" weight="medium" truncate>{name}</Text>
				{!!meta && (
					<SecondaryValue size="xs" truncate className={styles.numeric}>
						{meta}
					</SecondaryValue>
				)}
				{uploading && (
					<span
						role="progressbar"
						aria-label={copy.uploadProgressAria}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={percent}
						className={styles.attachmentTrack}
					>
						<span
							style={{ "--ai-progress": `${percent}%` } as React.CSSProperties}
							className={styles.attachmentBar}
						/>
					</span>
				)}
			</span>
		</>
	)

	return (
		<div
			data-errored={errored || undefined}
			className={cx("ai-attachment--component", styles.attachment, className)}
		>
			{onOpen ? (
				<button
					type="button"
					aria-label={copy.openAria}
					onClick={onOpen}
					className={styles.attachmentOpen}
				>
					{body}
				</button>
			) : (
				<span className={styles.attachmentOpen}>{body}</span>
			)}

			{!!onRemove && (
				<Button
					type="button"
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					aria-label={copy.removeAria}
					onClick={onRemove}
					className={styles.dismiss}
				>
					<XIcon />
				</Button>
			)}
		</div>
	)
}
