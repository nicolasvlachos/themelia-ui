import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as React from "react"

import { Separator } from "@/components/base/display"
import { cvm, type VariantProps } from "@/lib/cvm"
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
	 * Draws rules between rows instead of gaps, and neutral rows drop their inline padding.
	 * Use for a run of rows inside one card.
	 */
	ruled?: boolean
}

function ItemGroup({ className, ruled, ...props }: ItemGroupProps) {
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

/**
 * Item — a row. No size prop: row height follows `--density-scale`, so use a denser
 * scope for a denser list.
 */
function Item({
	className,
	surface = "neutral",
	render,
	...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
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

function ItemMedia({
	className,
	variant = "plain",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
	return (
		<div
			data-slot="item-media"
			data-variant={variant}
			className={cx("item-media--component", itemMediaVariants({ variant, className }))}
			{...props}
		/>
	)
}

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

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="item-actions" className={cx("item-actions--component", styles.actions, className)} {...props} />
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="item-header" className={cx("item-header--component", styles.header, className)} {...props} />
}

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
