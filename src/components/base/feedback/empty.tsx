/**
 * Empty — what a surface shows when it has nothing to show, with an `action` slot for the
 * next step. `mediaVariant` dresses the media (one prop, not four components); `padding`
 * sizes it from a panel cell to a whole page.
 */
import * as React from "react"

import { Heading, Text } from "@/components/base/typography"
import type { ComponentScale } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import { defaultEmptyStrings, type EmptyStrings } from "./empty.strings"
import styles from "./empty.module.css"

/**
 * Breathing room: `sm` for panels and cells, `default` for a card body or a page. Not
 * derived from provider density, which already reaches the paddings through the presets.
 */
export type EmptyPadding = ComponentScale

/**
 * How the `media` slot is dressed.
 *
 * `none`         — rendered raw; the media brings its own canvas.
 * `icon`         — a muted tile around a single glyph.
 * `icon-soft`    — the same tile, quieter, for a glyph that is not a status.
 * `illustration` — no chrome, centred, with room below and a reading-width ceiling.
 */
export type EmptyMediaVariant = "none" | "icon" | "icon-soft" | "illustration"

export interface EmptyMediaContext {
	mediaVariant: EmptyMediaVariant
}

export interface EmptyProps extends Omit<React.ComponentProps<"div">, "title"> {
	/** Icon or illustration: the visual. */
	media?: React.ReactNode
	/**
	 * The media's chrome. `none` renders the media raw; `icon` and `icon-soft` set a glyph in
	 * a tile; `illustration` centres it with room below.
	 */
	mediaVariant?: EmptyMediaVariant
	/** Media as a function of the variant, for a visual that changes with its chrome. */
	renderMedia?: (context: EmptyMediaContext) => React.ReactNode
	/**
	 * Names the absence: "No invoices yet", not "Nothing here". Falls back to `strings.title`,
	 * so a bare `<Empty />` still renders during scaffolding.
	 */
	title?: React.ReactNode
	/**
	 * Why it is empty, or what will fill it. `false` hides it, for a title that already tells
	 * the whole story.
	 */
	description?: React.ReactNode | false
	/**
	 * Buttons or links offering the next step. An empty state that only explains is a dead
	 * end.
	 */
	action?: React.ReactNode
	/** Quiet copy under the action — a hint, a learn-more, a shortcut. */
	footer?: React.ReactNode
	/**
	 * Breathing room, on both axes: `sm` for panels and cells, `default` for a card body or a
	 * page. The inline padding is what keeps copy off a dashed edge.
	 * @default "default"
	 */
	padding?: EmptyPadding
	/**
	 * The dashed outline. Off by default; use it when the empty state stands in for a card's
	 * body and the edge says "something goes here".
	 */
	border?: boolean
	/**
	 * Overrides this state's own copy: `title`, `description`, and `ariaLabel`. The region
	 * announces through `role="status"`, so a list that empties out while the reader is on the
	 * page says so.
	 */
	strings?: Partial<EmptyStrings>
}

const PADDING_CLASS: Record<EmptyPadding, string> = {
	default: styles.padDefault,
	sm: styles.padSm,
}

const MEDIA_CLASS: Record<EmptyMediaVariant, string | undefined> = {
	none: undefined,
	icon: styles.mediaIcon,
	"icon-soft": styles.mediaIconSoft,
	illustration: styles.mediaIllustration,
}

/**
 * What a surface shows when it has nothing to show, with an `action` slot for the next step.
 * `mediaVariant` dresses the media, and `padding` sizes it from a panel cell to a whole page.
 */
export function Empty({
	media,
	mediaVariant = "none",
	renderMedia,
	title,
	description,
	action,
	footer,
	padding = "default",
	border = false,
	className,
	children,
	strings,
	"aria-label": ariaLabel,
	...props
}: EmptyProps) {
	const copy = { ...defaultEmptyStrings, ...strings }
	const mediaNode = renderMedia ? renderMedia({ mediaVariant }) : media
	const resolvedTitle = title ?? copy.title
	const resolvedDescription = description === false ? null : (description ?? copy.description)

	return (
		<div
			data-slot="empty"
			role="status"
			aria-label={ariaLabel ?? copy.ariaLabel}
			className={cx(
				"empty--component",
				styles.root,
				PADDING_CLASS[padding],
				border && styles.bordered,
				className,
			)}
			{...props}
		>
			{!!mediaNode && (
				<div
					data-slot="empty-media"
					data-variant={mediaVariant}
					className={cx("empty--media", styles.media, MEDIA_CLASS[mediaVariant])}
				>
					{mediaNode}
				</div>
			)}
			{!!(resolvedTitle || resolvedDescription) && (
				<div className={styles.content}>
					{!!resolvedTitle && (
						<Heading level={3} size="base" data-slot="empty-title" className="empty--title">
							{resolvedTitle}
						</Heading>
					)}
					{!!resolvedDescription && (
						<Text align="center" type="secondary" data-slot="empty-description" className={cx("empty--description", styles.description)}>
							{resolvedDescription}
						</Text>
					)}
				</div>
			)}
			{children}
			{!!action && (
				<div data-slot="empty-actions" className={cx("empty--actions", styles.actions)}>
					{action}
				</div>
			)}
			{!!footer && (
				<Text align="center" tag="div" size="xs" type="secondary" data-slot="empty-footer" className="empty--footer">
					{footer}
				</Text>
			)}
		</div>
	)
}
