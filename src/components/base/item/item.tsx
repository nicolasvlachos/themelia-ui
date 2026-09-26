import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as React from "react"

import { Separator } from "@/components/base/display"
import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import { Text } from "@/components/base/typography"

import styles from "./item.module.css"

/*
 * Tells an `Item` it sits inside `ItemGroup`'s `role="list"`, so it can take `listitem`
 * (axe: aria-required-children). The group states the fact rather than inspecting its
 * children. Not exported; callers override with `role` on `Item`.
 */
const ItemGroupContext = React.createContext(false)

export interface ItemGroupProps extends React.ComponentProps<"div"> {
	/**
	 * Draws hairlines between rows instead of gaps, and neutral rows drop their inline
	 * padding and go flush. For a run of rows inside one card, where a rem of air between
	 * each reads as unrelated blocks. Bordered and muted rows keep their inset, because they
	 * do draw a surface.
	 */
	ruled?: boolean
}

/** Stacks rows and owns the dividers, so a row never draws its own. */
function ItemGroup({ className, ruled = false, ...props }: ItemGroupProps) {
	return (
		<ItemGroupContext.Provider value={true}>
			<div
				role="list"
				data-slot="item-group"
				data-ruled={ruled ? "" : undefined}
				className={cx("item-group--component", styles.group, className)}
				{...props}
			/>
		</ItemGroupContext.Provider>
	)
}

/**
 * A rule between items, for a group that wants one only in places. `ItemGroup ruled` is the
 * answer when every row needs one.
 */
function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
	/*
	 * Inside a list the rule is decoration: `aria-hidden` removes it (a `separator` is not a
	 * valid list child). Spread conditionally — an explicit `undefined` would override Base
	 * UI's `role="separator"` on standalone separators.
	 */
	const inGroup = React.useContext(ItemGroupContext)

	return (
		<Separator
			data-slot="item-separator"
			orientation="horizontal"
			{...(inGroup ? { "aria-hidden": true } : null)}
			className={cx("item-separator--component", styles.separator, className)}
			{...props}
		/>
	)
}

/* `surface`, not `variant`: the row's outer chrome. `neutral`, never `default`. */
const itemVariants = cvm(styles.root, {
	variants: {
		surface: {
			neutral: undefined,
			bordered: styles.surfaceBordered,
			muted: styles.surfaceMuted,
		},
	},
	defaultVariants: {
		surface: "neutral",
	},
})

export type ItemSurface = "neutral" | "bordered" | "muted"

interface ItemProps extends useRender.ComponentProps<"div"> {
	/** The row's chrome. Never `default`: the vocabulary is fixed. */
	surface?: "neutral" | "bordered" | "muted"
}

/**
 * A row — a list row, a menu row, a table row. No size prop: row height follows
 * `--density-scale`, so use a denser scope for a denser list.
 */
function Item({
	className,
	surface = "neutral",
	render,
	...props
}: ItemProps) {
	/*
	 * Only a kit-rendered row takes `listitem`; a caller's `role` still wins. A row rendered
	 * as a button or link can't carry `listitem`, so it gets a wrapper instead (below).
	 */
	const inGroup = React.useContext(ItemGroupContext)

	const row = useRender({
		defaultTagName: "div",
		props: mergeProps<"div">(
			{
				className: cx("item--component", itemVariants({ surface, className })),
				...(inGroup && !render ? { role: "listitem" as const } : null),
			},
			props,
		),
		render,
		state: { slot: "item", surface },
	})

	/*
	 * `listitem` wrapper around a caller-rendered control. `display: contents`, so layout is
	 * unchanged; `data-ruled` rules reach through one level (`> * > .root`).
	 */
	if (!inGroup || !render) return row

	return (
		<div role="listitem" className={styles.listItem}>
			{row}
		</div>
	)
}

const itemMediaVariants = cvm(styles.media, {
	variants: {
		variant: {
			plain: undefined,
			icon: styles.mediaIcon,
			image: styles.mediaImage,
		},
	},
	defaultVariants: {
		variant: "plain",
	},
})

interface ItemMediaProps extends React.ComponentProps<"div"> {
	/**
	 * Sizes the leading slot. `icon` fits a glyph; `image` gets the larger box an avatar or
	 * thumbnail needs; `plain` leaves the slot to its content.
	 */
	variant?: "plain" | "icon" | "image"
}

/** The leading slot: a glyph, an avatar or a thumbnail, aligned to the first line. */
function ItemMedia({
	className,
	variant = "plain",
	...props
}: ItemMediaProps) {
	return (
		<div
			data-slot="item-media"
			data-variant={variant}
			className={cx("item-media--component", itemMediaVariants({ variant, className }))}
			{...props}
		/>
	)
}

/**
 * The title and description. Takes the remaining width and truncates rather than pushing
 * the actions off the row.
 */
function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="item-content" className={cx("item-content--component", styles.content, className)} {...props} />
}

/* Composed from Text so the slot doesn't invent its own type tokens. */
function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<Text
			tag="div"
			size="inherit"
			weight="medium"
			data-slot="item-title"
			className={cx("item-title--component", styles.title, className)}
			{...props}
		/>
	)
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<Text
			tag="p"
			size="inherit"
			type="secondary"
			data-slot="item-description"
			className={cx("item-description--component", styles.description, className)}
			{...props}
		/>
	)
}

/** Trailing controls. Kept out of the content flow, so a long title cannot displace them. */
function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="item-actions" className={cx("item-actions--component", styles.actions, className)} {...props} />
}

/**
 * A full-width row above the row's own content, for an item that carries an eyebrow
 * without it competing with the title line.
 */
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="item-header" className={cx("item-header--component", styles.header, className)} {...props} />
}

/**
 * A full-width row below the row's own content, for an item that carries a footnote
 * without it competing with the title line.
 */
function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="item-footer" className={cx("item-footer--component", styles.footer, className)} {...props} />
}

export {
	Item,
	ItemMedia,
	ItemContent,
	ItemActions,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
	ItemDescription,
	ItemHeader,
	ItemFooter,
}
