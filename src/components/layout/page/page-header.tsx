/**
 * PageHeader: base PageHeading plus what a routed page needs (a back control, a title
 * icon that may be a link, badges as data). Navigation goes through `renderLink`.
 */
import { ArrowLeftIcon } from "lucide-react"
import type { ComponentType, ReactElement, ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { Separator } from "@/components/base/display"
import {
	PageHeading, type PageHeadingBadge, type PageHeadingProps,
} from "@/components/base/navigation"
import { cx } from "@/lib/cx"

import { resolveLayoutLinkRenderer, type LayoutNavigationAdapter } from "../layout.types"
import { defaultPageHeaderStrings, type PageHeaderStrings } from "./page-header.strings"
import styles from "./page.module.css"

export interface PageHeaderSlots {
	/** Replaces the leading back control entirely. */
	back?: ReactNode
	/** Between the eyebrow and the title row. */
	beforeTitle?: ReactNode
	/** Directly under the description — a metadata line. */
	afterDescription?: ReactNode
	/** Replaces the trailing actions region. */
	actions?: ReactNode
}

export interface PageHeaderProps
	extends LayoutNavigationAdapter,
		Pick<PageHeadingProps, "eyebrow" | "description" | "level" | "breadcrumbs" | "withSeparator" | "className"> {
	title: ReactNode
	/** Decorative glyph before the title. Centred on the title line, never on the block. */
	titleIcon?: ComponentType<{ className?: string }>
	/** Makes the title icon a link. Routed through `renderLink` like everything else. */
	titleIconHref?: string
	/** Makes the title icon a button. Takes precedence over `titleIconHref`. */
	onTitleIconClick?: () => void
	/** Overrides this header's own copy: the back control's and the title icon's accessible names. */
	strings?: Partial<PageHeaderStrings>
	/** Destination for the back control. Either this or `onBack` makes it appear. */
	backHref?: string
	onBack?: () => void
	/** Status marks beside the title, as data — the tone comes from the kit's vocabulary. */
	titleBadges?: PageHeadingBadge[]
	actions?: ReactNode
	slots?: PageHeaderSlots
	children?: ReactNode
}

export function PageHeader({
	title,
	description,
	eyebrow,
	level = 1,
	titleIcon: TitleIcon,
	titleIconHref,
	onTitleIconClick,
	strings,
	backHref,
	onBack,
	titleBadges,
	breadcrumbs,
	actions,
	slots,
	withSeparator,
	renderLink,
	className,
	children,
}: PageHeaderProps) {
	const copy = { ...defaultPageHeaderStrings, ...strings }
	const link = resolveLayoutLinkRenderer({ renderLink })
	const hasBack = !!backHref || !!onBack

	/* A real link when there is an href (middle-click, new tab); a button for `onBack`. */
	const defaultBack = hasBack ? (
		<div className={styles.headerBack}>
			{backHref && !onBack ? (
				<Button
					/* The button renders as the link and supplies its own children. */
					render={link({ href: backHref, children: null }) as ReactElement}
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					aria-label={copy.back}
				>
					<ArrowLeftIcon aria-hidden />
				</Button>
			) : (
				<Button
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					aria-label={copy.back}
					onClick={onBack}
				>
					<ArrowLeftIcon aria-hidden />
				</Button>
			)}
			<Separator orientation="vertical" className={styles.headerBackRule} />
		</div>
	) : null

	const titlePrefix = (() => {
		if (!TitleIcon) return null
		const glyph = <TitleIcon aria-hidden />

		if (onTitleIconClick) {
			return (
				<Button
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					aria-label={copy.titleIcon}
					onClick={onTitleIconClick}
				>
					{glyph}
				</Button>
			)
		}
		if (titleIconHref) {
			return (
				<Button
					render={link({ href: titleIconHref, children: null }) as ReactElement}
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					aria-label={copy.titleIcon}
				>
					{glyph}
				</Button>
			)
		}
		// Decorative: no name, no focus stop.
		return (
			<span aria-hidden className={styles.headerTitleIcon}>
				{glyph}
			</span>
		)
	})()

	return (
		<PageHeading
			data-slot="page-header"
			className={cx("page-header--component", className)}
			title={title}
			description={description}
			eyebrow={eyebrow}
			level={level}
			breadcrumbs={breadcrumbs}
			leading={slots?.back ?? defaultBack}
			beforeTitle={slots?.beforeTitle}
			afterDescription={slots?.afterDescription}
			titlePrefix={titlePrefix}
			badges={titleBadges}
			actions={slots?.actions ?? actions}
			withSeparator={withSeparator}
		>
			{children}
		</PageHeading>
	)
}
