/**
 * Resource: the index and show skeletons. `loading`, `error` and `empty` replace the body
 * rather than sitting beside stale content.
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { ContentBlock, IconBadge, MetadataList } from "@/components/base/display"
import { Empty, ErrorState, LoadingState } from "@/components/base/feedback"
import { OverflowTabBar, PageHeading } from "@/components/base/navigation"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { Initials } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultResourceStrings } from "./resource.strings"
import type {
	ResourceActionBarProps, ResourceDetailsSectionProps, ResourceEmptyStateProps,
	ResourceHeaderProps, ResourceIndexShellProps, ResourceShowShellProps,
	TabbedResourceShellProps,
} from "./resource.types"
import styles from "./resource.module.css"

export function ResourceHeader({
	title,
	description,
	eyebrow,
	media,
	avatarUrl,
	avatarAlt,
	avatarFallback,
	icon: Icon,
	iconTone = "neutral",
	badges,
	metadata,
	actions,
	className,
	contentClassName,
	mediaClassName,
}: ResourceHeaderProps) {
	const titleText = typeof title === "string" ? title : ""

	/* Ordered, not exclusive: media, then avatar, then icon. */
	const resolvedMedia =
		media ??
		(avatarUrl || avatarFallback ? (
			<Avatar className={cx("resource-header--avatar", styles.headerAvatar, mediaClassName)}>
				{!!avatarUrl && <AvatarImage src={avatarUrl} alt={avatarAlt ?? titleText} />}
				<AvatarFallback>
					{avatarFallback ?? <Initials value={titleText} strategy="first-words" />}
				</AvatarFallback>
			</Avatar>
		) : Icon ? (
			<IconBadge
				icon={<Icon />}
				shape="rounded"
				tone={iconTone}
				className={cx("resource-header--icon", styles.headerIcon, mediaClassName)}
			/>
		) : null)

	return (
		<PageHeading
			eyebrow={eyebrow}
			title={title}
			description={description}
			leading={resolvedMedia}
			titleSuffix={
				badges ? (
					<Stack
						data-slot="resource-header-badges"
						direction="horizontal"
						gap="sm"
						className={cx("resource-header--badges", styles.headerBadges)}
					>
						{badges}
					</Stack>
				) : undefined
			}
			afterDescription={
				metadata ? (
					<div data-slot="resource-header-metadata" className={cx("resource-header--metadata", styles.headerMetadata)}>
						{metadata}
					</div>
				) : undefined
			}
			actions={actions}
			withSeparator={false}
			className={cx("resource-header--component", className)}
			contentClassName={contentClassName}
		/>
	)
}

export function ResourceActionBar({
	children,
	leading,
	trailing,
	sticky = false,
	className,
}: ResourceActionBarProps) {
	return (
		<div
			data-slot="resource-action-bar"
			className={cx("resource-action-bar--component", styles.actionBar, sticky && styles.actionBarSticky, className)}
		>
			<Stack
				direction={{ base: "vertical", sm: "horizontal" }}
				gap="lg"
				align={{ sm: "center" }}
				justify={{ sm: "between" }}
				wrap={{ sm: false }}
			>
				<Stack
					data-slot="resource-action-leading"
					direction="horizontal"
					gap="md"
					align="center"
					wrap
					className={styles.actionBarLeading}
				>
					{leading ?? children}
				</Stack>
				{!!trailing && (
					<Stack
						data-slot="resource-action-trailing"
						direction="horizontal"
						gap="md"
						align="center"
						className={styles.actionBarTrailing}
					>
						{trailing}
					</Stack>
				)}
			</Stack>
		</div>
	)
}

export function ResourceEmptyState({ className, ...props }: ResourceEmptyStateProps) {
	return (
		<Empty
			data-slot="resource-empty-state"
			className={cx("resource-empty-state--component", className)}
			{...props}
		/>
	)
}

function ResourceShellFrame({
	children,
	title,
	description,
	actions,
	toolbar,
	empty = false,
	loading = false,
	error,
	onRetry,
	slots,
	className,
	headerClassName,
	contentClassName,
	strings,
	asideClassName,
	variant,
}: ResourceShowShellProps & { variant: "index" | "show" }) {
	const copy = { ...defaultResourceStrings, ...strings }

	const header =
		slots?.header ??
		(title ? (
			<ResourceHeader
				title={title}
				description={description}
				actions={actions}
				className={headerClassName}
			/>
		) : null)

	const toolbarNode = slots?.toolbar ?? toolbar

	const loadingNode = slots?.loading ?? (
		<LoadingState label={copy.loadingLabel} className={styles.stateSurface} />
	)

	const emptyNode = slots?.empty ?? (
		<ResourceEmptyState title={copy.emptyTitle} description={copy.emptyDescription} border />
	)

	/*
	 * An Error, string or number is a message for the generated state; any other node is
	 * rendered as the error state itself (e.g. a 404 panel).
	 */
	const errorIsMessage =
		error instanceof Error || typeof error === "string" || typeof error === "number"
	const errorNode =
		slots?.error ??
		(error && !errorIsMessage && typeof error !== "boolean" ? (
			error
		) : (
			<ErrorState
				title={copy.errorTitle}
				description={
					error instanceof Error
						? error.message
						: typeof error === "string" || typeof error === "number"
							? String(error)
							: copy.errorDescription
				}
				onRetry={onRetry}
				strings={{ retry: copy.retryLabel }}
				className={styles.stateSurface}
			/>
		))

	const body = loading ? loadingNode : error ? errorNode : empty ? emptyNode : children

	return (
		<section
			data-slot={`resource-${variant}-shell`}
			className={cx(`resource-${variant}-shell--component`, styles.shell, className)}
		>
			<div
				data-slot={`resource-${variant}-layout`}
				data-has-aside={slots?.aside ? "" : undefined}
				className={styles.layout}
			>
				<Stack gap="xl" className={styles.primary}>
					{!!header && (
						<div data-slot={`resource-${variant}-header`}>{header}</div>
					)}
					{!!toolbarNode && (
						<div data-slot={`resource-${variant}-toolbar`}>{toolbarNode}</div>
					)}
					<div
						data-slot={`resource-${variant}-content`}
						className={cx(styles.content, contentClassName)}
					>
						{body}
					</div>
					{!!slots?.footer && (
						<div data-slot={`resource-${variant}-footer`}>{slots.footer}</div>
					)}
				</Stack>
				{!!slots?.aside && (
					<aside
						data-slot={`resource-${variant}-aside`}
						className={cx(styles.aside, asideClassName)}
					>
						{slots.aside}
					</aside>
				)}
			</div>
		</section>
	)
}

export function ResourceIndexShell(props: ResourceIndexShellProps) {
	return <ResourceShellFrame {...props} variant="index" />
}

export function ResourceShowShell(props: ResourceShowShellProps) {
	return <ResourceShellFrame {...props} variant="show" />
}

export function TabbedResourceShell({
	tabs,
	activeTab,
	onTabChange,
	tabsClassName,
	toolbar,
	slots,
	className,
	strings,
	...props
}: TabbedResourceShellProps) {
	const copy = { ...defaultResourceStrings, ...strings }

	const toolbarNode = (
		<Stack gap="lg" data-slot="tabbed-resource-toolbar">
			<OverflowTabBar
				items={tabs}
				value={activeTab}
				onValueChange={onTabChange}
				className={tabsClassName}
				strings={{ label: copy.tabsLabel }}
			/>
			{toolbar}
		</Stack>
	)

	return (
		<ResourceShowShell
			{...props}
			strings={strings}
			className={cx("tabbed-resource-shell--component", className)}
			// The tab row goes in the toolbar slot, so `slots.toolbar` still wins outright.
			slots={{ ...slots, toolbar: slots?.toolbar ?? toolbarNode }}
		/>
	)
}

export function ResourceDetailsSection({
	metadata,
	metadataColumns = 2,
	metadataDense = false,
	body,
	help,
	children,
	footer,
	padding = "md",
	surface = "bordered",
	className,
	contentClassName,
	...props
}: ResourceDetailsSectionProps) {
	return (
		<ContentBlock
			data-slot="resource-details-section"
			surface={surface}
			data-padding={padding}
			className={cx("resource-details-section--component", styles.section, className)}
			{...props}
		>
			<div className={cx(styles.sectionContent, contentClassName)}>
				{!!metadata?.length && (
					<MetadataList
						items={metadata}
						columns={metadataColumns}
						density={metadataDense ? "compact" : "default"}
					/>
				)}
				{body}
				{children}
				{!!help && (
					<Text size="xs" type="secondary" className="resource-details-section--help">
						{help}
					</Text>
				)}
			</div>
			{!!footer && <div data-slot="resource-details-footer" className={styles.sectionFooter}>{footer}</div>}
		</ContentBlock>
	)
}

