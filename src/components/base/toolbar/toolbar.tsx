"use client"

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import * as React from "react"

import { Button, type ButtonProps } from "@/components/base/buttons"
import { cx } from "@/lib/cx"

import styles from "./toolbar.module.css"

export interface ToolbarProps
	extends ToolbarPrimitive.Root.Props,
		Pick<ToolbarPrimitive.Root.Props, "orientation" | "disabled" | "loopFocus"> {}

/**
 * A named set of related controls: `role="toolbar"`, with one roving tab stop and
 * orientation-aware arrow navigation. `orientation`, `disabled` and `loopFocus` come from
 * Base UI's toolbar root. Supply `aria-label` or `aria-labelledby` whenever no visible label
 * names the set.
 */
export function Toolbar({ className, ...props }: ToolbarProps) {
	return (
		<ToolbarPrimitive.Root
			data-slot="toolbar"
			className={cx("toolbar--component", styles.root, className)}
			{...props}
		/>
	)
}

export interface ToolbarGroupProps
	extends ToolbarPrimitive.Group.Props,
		Pick<ToolbarPrimitive.Group.Props, "disabled"> {}

/** Groups related items, and can disable the group as one unit. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
	return (
		<ToolbarPrimitive.Group
			data-slot="toolbar-group"
			className={cx("toolbar--group", styles.group, className)}
			{...props}
		/>
	)
}

export interface ToolbarButtonProps
	extends Omit<ToolbarPrimitive.Button.Props, "render">,
		Pick<ButtonProps, "tone" | "buttonStyle" | "iconOnly" | "loading" | "fullWidth"> {
	/** Replaces the kit Button while retaining toolbar navigation behavior. */
	render?: React.ReactElement
}

/**
 * A toolbar item rendered through the kit Button: Base UI owns the navigation behaviour, the
 * Button its look. It takes `tone`, `buttonStyle`, `iconOnly`, `loading` and `render`.
 */
export function ToolbarButton({
	render,
	tone = "neutral",
	buttonStyle = "ghost",
	iconOnly,
	loading,
	fullWidth,
	className,
	...props
}: ToolbarButtonProps) {
	return (
		<ToolbarPrimitive.Button
			{...props}
			disabled={props.disabled || loading}
			render={
				render ?? (
					<Button
						tone={tone}
						buttonStyle={buttonStyle}
						iconOnly={iconOnly}
						loading={loading}
						fullWidth={fullWidth}
					/>
				)
			}
			data-slot="toolbar-button"
			className={cx("toolbar--button", styles.button, className)}
		/>
	)
}

export interface ToolbarLinkProps extends ToolbarPrimitive.Link.Props {}

/** An anchor item that joins the same roving-focus order. */
export function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
	return (
		<ToolbarPrimitive.Link
			data-slot="toolbar-link"
			className={cx("toolbar--link", styles.link, className)}
			{...props}
		/>
	)
}

export interface ToolbarInputProps extends ToolbarPrimitive.Input.Props {}

/** A native input item that joins the same roving-focus order. */
export function ToolbarInput({ className, ...props }: ToolbarInputProps) {
	return (
		<ToolbarPrimitive.Input
			data-slot="toolbar-input"
			data-field-control=""
			className={cx("toolbar--input", styles.input, className)}
			{...props}
		/>
	)
}

export interface ToolbarSeparatorProps extends ToolbarPrimitive.Separator.Props {}

/** A rule between items. It takes the orientation opposite to the toolbar's. */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
	return (
		<ToolbarPrimitive.Separator
			data-slot="toolbar-separator"
			className={cx("toolbar--separator", styles.separator, className)}
			{...props}
		/>
	)
}
