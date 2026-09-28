"use client"

import { Command as CommandPrimitive } from "cmdk"
import { CheckIcon, SearchIcon } from "lucide-react"
import * as React from "react"

import { DialogContent } from "@/components/base/dialog"
import { InputGroup, InputGroupAddon } from "@/components/base/input-group"
import {
	Overlay,
	OverlayDescription,
	OverlayHeader,
	OverlayTitle,
	type OverlayRootProps,
} from "@/components/base/overlay"
import { Text, textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultCommandStrings, type CommandStrings } from "./command.strings"
import styles from "./command.module.css"

export type CommandProps = React.ComponentProps<typeof CommandPrimitive>

const CommandDialogInputContext = React.createContext<React.RefObject<HTMLInputElement | null> | null>(null)

/**
 * The command palette's root: filtering, keyboard navigation and the rows' shared state. It
 * sets the rows' type; a group heading and a shortcut take the small step.
 */
function Command({ className, ...props }: CommandProps) {
	return (
		<CommandPrimitive
			data-slot="command"
			className={cx("command--component", styles.root, textClassName({ size: "sm" }), className)}
			{...props}
		/>
	)
}

export type CommandDialogProps = Omit<OverlayRootProps, "children"> & {
	/** Shorthand for `strings.title`: the palette's accessible name. */
	title?: string
	/** Shorthand for `strings.description`. */
	description?: string
	/** Overrides this palette's own copy. All of it is hidden from view. */
	strings?: Partial<CommandStrings>
	/**
	 * Configures the cmdk root the dialog owns: custom filtering, looping, labels, and other
	 * command behaviour.
	 */
	commandProps?: CommandProps
	className?: string
	showCloseButton?: boolean
	children: React.ReactNode
}

/**
 * The palette as an overlay, opened and closed through `open` and `onOpenChange`. The
 * caller binds the shortcut that opens it.
 */
function CommandDialog({
	title,
	description,
	strings,
	commandProps,
	children,
	className,
	showCloseButton = false,
	...props
}: CommandDialogProps) {
	const inputRef = React.useRef<HTMLInputElement>(null)
	const copy = {
		...defaultCommandStrings,
		...strings,
		...(title ? { title } : null),
		...(description ? { description } : null),
	}

	return (
		<Overlay {...props}>
			<DialogContent
				className={cx("command-dialog--component", styles.dialogContent, className)}
				showCloseButton={showCloseButton}
				aria-label={copy.title}
				initialFocusRef={inputRef}
			>
				{/* The header sits inside the content so the portalled dialog is named. */}
				<OverlayHeader className="sr-only">
					<OverlayTitle>{copy.title}</OverlayTitle>
					<OverlayDescription>{copy.description}</OverlayDescription>
				</OverlayHeader>
				{/* The dialog supplies the cmdk root; without it every cmdk child throws on mount. */}
				<CommandDialogInputContext.Provider value={inputRef}>
					<Command {...commandProps}>{children}</Command>
				</CommandDialogInputContext.Provider>
			</DialogContent>
		</Overlay>
	)
}

/** The filter. Owns focus when the palette opens. */
function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
	const dialogInputRef = React.useContext(CommandDialogInputContext)
	const { ref: consumerRef, ...inputProps } = props
	const inputRef = React.useRef<HTMLInputElement>(null)

	React.useImperativeHandle(dialogInputRef, () => inputRef.current as HTMLInputElement)
	React.useImperativeHandle(consumerRef, () => inputRef.current as HTMLInputElement)

	return (
		<div data-slot="command-input-wrapper" className={styles.inputWrapper}>
			<InputGroup className={styles.inputGroup}>
				<CommandPrimitive.Input
					{...inputProps}
					ref={inputRef}
					data-slot="command-input"
					className={cx("command-input--component", styles.input, className)}
				/>
				<InputGroupAddon>
					<SearchIcon className={styles.searchIcon} data-sized="" />
				</InputGroupAddon>
			</InputGroup>
		</div>
	)
}

/** The scrolling list of results. */
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List data-slot="command-list" className={cx("command-list--component", styles.list, className)} {...props} />
	)
}

/** Shown when nothing matches. Not optional — a silent empty list reads as broken. */
function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className={cx("command-empty--component", styles.empty, className)}
			{...props}
		/>
	)
}

/*
 * cmdk's `scrollIntoView` scrolls every scrollable ancestor, the page included, so rows
 * and group headings override it to scroll only their own list.
 */
function scrollWithinList(node: HTMLElement) {
	const list = node.closest<HTMLElement>("[cmdk-list]")
	if (!list) return
	const viewport = list.getBoundingClientRect()
	const box = node.getBoundingClientRect()
	if (box.top < viewport.top) list.scrollTop += box.top - viewport.top
	else if (box.bottom > viewport.bottom) list.scrollTop += box.bottom - viewport.bottom
}

function keepScrollInList(node: HTMLElement | null) {
	if (node) node.scrollIntoView = () => scrollWithinList(node)
}

function withListScroll<T extends HTMLElement>(ref: React.Ref<T> | undefined, find?: (node: T) => HTMLElement | null) {
	return (node: T | null) => {
		keepScrollInList(node && find ? find(node) : node)
		if (typeof ref === "function") ref(node)
		else if (ref) ref.current = node
	}
}

const groupHeading = (node: HTMLElement) => node.querySelector<HTMLElement>("[cmdk-group-heading]")

/** A captioned block of rows. */
function CommandGroup({
	className,
	ref,
	heading,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group> &
	Pick<React.ComponentProps<typeof CommandPrimitive.Group>, "heading">) {
	return (
		<CommandPrimitive.Group
			ref={withListScroll(ref, groupHeading)}
			data-slot="command-group"
			className={cx("command-group--component", styles.group, className)}
			/* cmdk renders the heading's element; the caption's type goes inside it. */
			heading={
				heading ? (
					<Text tag="span" size="xs" weight="medium" type="secondary">
						{heading}
					</Text>
				) : (
					heading
				)
			}
			{...props}
		/>
	)
}

/**
 * The rule between groups. Presentational and skipped by the keyboard, so arrowing through
 * results never lands on it.
 */
function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cx("command-separator--component", styles.separator, className)}
			aria-hidden="true"
			{...props}
		/>
	)
}

/** A row. Its `value` is what the filter matches; its label is what is read. */
function CommandItem({
	className,
	children,
	ref,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item> &
	Pick<React.ComponentProps<typeof CommandPrimitive.Item>, "value" | "onSelect">) {
	return (
		<CommandPrimitive.Item
			ref={withListScroll(ref)}
			data-slot="command-item"
			className={cx("command-item--component", styles.item, className)}
			{...props}
		>
			{children}
			<CheckIcon className={styles.check} />
		</CommandPrimitive.Item>
	)
}

/** The key hint at the end of a row. */
function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="command-shortcut"
			className={cx("command-shortcut--component", styles.shortcut, textClassName({ size: "xs", caps: true }), className)}
			{...props}
		/>
	)
}

export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
}
