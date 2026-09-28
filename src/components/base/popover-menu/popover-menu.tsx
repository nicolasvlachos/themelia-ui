import { Loader2Icon, RotateCcwIcon } from "lucide-react"
import {
	useLayoutEffect, useRef, useState,
	type ComponentProps, type KeyboardEvent, type ReactElement, type ReactNode, type Ref,
} from "react"

import { Button } from "@/components/base/buttons"
import {
	Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/base/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Text, textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultPopoverMenuStrings, type PopoverMenuStrings } from "./popover-menu.strings"
import styles from "./popover-menu.module.css"
import type { PopoverMenuItem } from "./popover-menu.types"

export interface PopoverMenuProps<T = unknown> {
	/** The clickable the popover anchors to. */
	trigger: ReactElement
	/**
	 * The choices. Each carries a `value`, a `label`, and optional media — an `icon`, a
	 * `description`.
	 */
	items: readonly PopoverMenuItem<T>[]
	/** Receives the chosen item. The menu does not own a persistent selection. */
	onSelect: (item: PopoverMenuItem<T>) => void

	/** Controlled openness, for a menu opened from somewhere other than its trigger. */
	open?: boolean
	/** Called with the next open state. Pair with `open`. */
	onOpenChange?: (open: boolean) => void

	/** Shows the search field above the list. */
	search?: boolean
	/**
	 * Controlled search value. Supplying `onSearchChange` also hands filtering to the
	 * caller: the local matcher turns off. `strings.searchPlaceholder` is the field's
	 * placeholder.
	 */
	searchValue?: string
	/**
	 * Called with the search text. Supplying it hands filtering to the caller — the local
	 * matcher steps aside rather than filtering an already filtered list.
	 */
	onSearchChange?: (value: string) => void
	/**
	 * Characters the search needs before rows show, measured on the trimmed text, controlled
	 * or not. An empty field still shows `items`; from one character up to the minimum,
	 * `strings.formatTypeToSearch(minimum)` shows instead.
	 */
	minSearchLength?: number

	/**
	 * Puts a strip in place of the list while results are in flight — an async picker with no
	 * state reads as an empty one.
	 */
	loading?: boolean
	/**
	 * The items could not be loaded: `true` shows `strings.error`, any other node is the
	 * message. Replaces the rows and the empty state, and gives way to `loading`.
	 */
	error?: ReactNode
	/** Wiring this puts a retry control, labelled by `strings.retry`, under the error. */
	onRetry?: () => void

	/** Band above the search field, running edge to edge. */
	header?: ReactNode
	/** Band below the list, running edge to edge — confirm and clear buttons. */
	footer?: ReactNode
	/**
	 * Closes the popover after a row is chosen and returns focus to the trigger. True unless
	 * a `footer` is present: a footer holds confirm and clear actions, which is the
	 * multi-pick shape.
	 */
	closeOnSelect?: boolean
	/**
	 * Shown when nothing matches, as a rendered node; for plain copy, use `strings.empty`.
	 * Required in spirit: a filter that matches nothing has to say so.
	 */
	empty?: ReactNode
	/** Replaces the default spinner strip. */
	loadingSlot?: ReactNode

	/** Overrides this menu's own copy — the filter placeholder, the loading, empty and error rows. */
	strings?: Partial<PopoverMenuStrings>

	/** Replaces a row, for an option carrying an avatar or a colour. */
	renderItem?: (item: PopoverMenuItem<T>) => ReactNode

	/** How the surface lines up with the trigger. */
	align?: ComponentProps<typeof PopoverContent>["align"]
	/** Gap between the trigger and the surface, in pixels. */
	sideOffset?: ComponentProps<typeof PopoverContent>["sideOffset"]
	/**
	 * Names the list, and the search field when there is one. Most needed with
	 * `search={false}`, where the list itself is what focus lands on.
	 */
	label?: string
	/** Class for the popover surface. */
	className?: string
}

/**
 * A "trigger → optional header → search → list" picker: filter facets, operator selects,
 * assignee menus. For other shapes compose `Popover` and `Command`; inside a surface
 * something else owns, render `PopoverMenuPanel`.
 */
export function PopoverMenu<T = unknown>({
	trigger,
	items,
	onSelect,
	open,
	onOpenChange,
	search = true,
	searchValue,
	onSearchChange,
	minSearchLength = 0,
	loading = false,
	error,
	onRetry,
	header,
	footer,
	closeOnSelect,
	empty,
	loadingSlot,
	strings,
	renderItem,
	align = "start",
	sideOffset,
	label,
	className,
}: PopoverMenuProps<T>) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
	const isOpen = open ?? uncontrolledOpen
	const setOpen = (next: boolean) => {
		if (open === undefined) setUncontrolledOpen(next)
		onOpenChange?.(next)
	}
	const shouldClose = closeOnSelect ?? footer == null
	// Without a search field, focus goes to the list: the popup itself is outside cmdk's keys.
	const panelListRef = useRef<HTMLDivElement>(null)
	return (
		<Popover open={isOpen} onOpenChange={setOpen}>
			<PopoverTrigger render={trigger} />
			<PopoverContent
				align={align}
				sideOffset={sideOffset}
				inset="flush"
				initialFocus={search ? undefined : panelListRef}
				className={cx("popover-menu--component", styles.content, className)}
			>
				<PopoverMenuPanel<T>
					ref={panelListRef}
					items={items}
					onSelect={(item) => {
						onSelect(item)
						if (shouldClose) setOpen(false)
					}}
					search={search}
					searchValue={searchValue}
					onSearchChange={onSearchChange}
					minSearchLength={minSearchLength}
					loading={loading}
					error={error}
					onRetry={onRetry}
					header={header}
					footer={footer}
					empty={empty}
					loadingSlot={loadingSlot}
					strings={strings}
					renderItem={renderItem}
					label={label}
				/>
			</PopoverContent>
		</Popover>
	)
}

export interface PopoverMenuPanelProps<T = unknown> {
	/**
	 * The choices. Each carries a `value`, a `label`, and optional media — an `icon`, a
	 * `description`.
	 */
	items: readonly PopoverMenuItem<T>[]
	/** A row was chosen. The panel neither tracks selection nor closes; its host decides both. */
	onSelect: (item: PopoverMenuItem<T>) => void

	/**
	 * Shows the search field above the list. Without it the list is the tab stop — a listbox
	 * pointing at the highlighted row — so the arrows and Enter work in a host whose own
	 * initial focus lands on the first tabbable element.
	 */
	search?: boolean
	/**
	 * Controlled search value. Supplying `onSearchChange` also hands filtering to the
	 * caller: the local matcher turns off.
	 */
	searchValue?: string
	/**
	 * Called with the search text. Supplying it hands filtering to the caller — the local
	 * matcher steps aside rather than filtering an already filtered list.
	 */
	onSearchChange?: (value: string) => void
	/**
	 * Characters the search needs before rows show, measured on the trimmed text, controlled
	 * or not. An empty field still shows `items`; from one character up to the minimum,
	 * `strings.formatTypeToSearch(minimum)` shows instead.
	 */
	minSearchLength?: number

	/**
	 * Puts a strip in place of the list while results are in flight — an async picker with no
	 * state reads as an empty one.
	 */
	loading?: boolean
	/**
	 * The items could not be loaded: `true` shows `strings.error`, any other node is the
	 * message. Replaces the rows and the empty state, and gives way to `loading`.
	 */
	error?: ReactNode
	/** Wiring this puts a retry control, labelled by `strings.retry`, under the error. */
	onRetry?: () => void

	/** Band above the search field, running edge to edge. */
	header?: ReactNode
	/** Band below the list, running edge to edge — confirm and clear buttons. */
	footer?: ReactNode
	/**
	 * Shown when nothing matches, as a rendered node; for plain copy, use `strings.empty`.
	 * Required in spirit: a filter that matches nothing has to say so.
	 */
	empty?: ReactNode
	/** Replaces the default spinner strip. */
	loadingSlot?: ReactNode

	/** Overrides the panel's own copy — the filter placeholder, the loading, empty and error rows. */
	strings?: Partial<PopoverMenuStrings>

	/** Replaces a row, for an option carrying an avatar or a colour. */
	renderItem?: (item: PopoverMenuItem<T>) => ReactNode

	/**
	 * Names the list, and the search field when there is one. Most needed with
	 * `search={false}`, where the list itself is what focus lands on. The filter editors
	 * pass the filter's name.
	 */
	label?: string

	/**
	 * The list element. Without a search field it is the tab stop, and what a host's
	 * `initialFocus` should target.
	 */
	ref?: Ref<HTMLDivElement>
	/** Class for the command root, beside `popover-menu-panel--component`. */
	className?: string
}

/*
 * cmdk's root claims Enter, the arrows, Home and End anywhere inside it (Enter with
 * preventDefault); stopping them in the bands keeps their buttons keyboard-operable.
 */
const LIST_KEYS = new Set(["Enter", "ArrowUp", "ArrowDown", "Home", "End"])

function keepKeysOutOfList(event: KeyboardEvent<HTMLElement>) {
	if (LIST_KEYS.has(event.key)) event.stopPropagation()
}

/**
 * The body of a `PopoverMenu` (header, search, rows, footer) without the popover, for a
 * surface something else owns: one step of a two-step popup, a sheet on a phone. The panel
 * owns no selection and closes nothing — the surface hosting it decides both.
 *
 * One state shows at a time, in this order of precedence: a query shorter than
 * `minSearchLength`, then `loading`, then `error`, then the rows. Enter, the arrows, Home
 * and End pressed in a band or on the retry control stay there instead of reaching the
 * list.
 */
export function PopoverMenuPanel<T = unknown>({
	items,
	onSelect,
	search = true,
	searchValue,
	onSearchChange,
	minSearchLength = 0,
	loading = false,
	error,
	onRetry,
	header,
	footer,
	empty,
	loadingSlot,
	strings,
	renderItem,
	label,
	ref,
	className,
}: PopoverMenuPanelProps<T>) {
	const copy = { ...defaultPopoverMenuStrings, ...strings }

	/*
	 * With no field, the list is the tab stop: cmdk makes it a named listbox with
	 * `aria-activedescendant`, and its keys bubble to the command root.
	 */
	const listRef = useRef<HTMLDivElement | null>(null)
	const setListRef = (node: HTMLDivElement | null) => {
		listRef.current = node
		if (typeof ref === "function") ref(node)
		else if (ref) ref.current = node
	}

	// Tracked via `onValueChange`, not by controlling the input: that would turn local filtering off.
	const [ownSearch, setOwnSearch] = useState("")
	const query = (searchValue ?? ownSearch).trim()

	// One state at a time: below the minimum, then loading, then error (replacing rows), then rows.
	const belowMinimum = query.length > 0 && query.length < minSearchLength
	const busy = loading && !belowMinimum
	const failed = !belowMinimum && !loading && error != null && error !== false
	const showRows = !belowMinimum && !failed

	/*
	 * Tabbable when there is no field, so any host popup's default initial focus lands on it.
	 * Set on the node: cmdk writes `tabIndex={-1}` after the props it is given.
	 */
	useLayoutEffect(() => {
		const list = listRef.current
		if (list) list.tabIndex = search ? -1 : 0
	}, [search])

	return (
		<Command
			/* Names the search field, when there is one. */
			label={label}
			shouldFilter={!onSearchChange}
			className={cx(
				"popover-menu-panel--component",
				"popover-menu--collection",
				className,
			)}
		>
			{header != null && (
				<div
					className={cx("popover-menu--header", styles.band, styles.header)}
					onKeyDown={keepKeysOutOfList}
				>
					{header}
				</div>
			)}

			{search && (
				<CommandInput
					placeholder={copy.searchPlaceholder}
					value={searchValue}
					onValueChange={(next) => {
						if (searchValue === undefined) setOwnSearch(next)
						onSearchChange?.(next)
					}}
				/>
			)}

			<CommandList
				ref={setListRef}
				label={label}
				className={styles.list}
			>
				{busy &&
					(loadingSlot ?? (
						<div className={styles.loading}>
							<Loader2Icon aria-hidden className={styles.loadingIcon} />
							<Text tag="span" size="xs" type="secondary">
								{copy.loading}
							</Text>
						</div>
					))}

				{/* The empty state waits until loading ends. */}
				{showRows && !loading && <CommandEmpty>{empty ?? copy.empty}</CommandEmpty>}

				{showRows && items.length > 0 && (
					<CommandGroup>
						{items.map((item) => (
							<CommandItem
								key={item.value}
								value={item.searchValue ?? item.value}
								onSelect={() => onSelect(item)}
								disabled={item.disabled}
								data-checked={item.selected || undefined}
								className={styles.item}
							>
								{renderItem ? (
									renderItem(item)
								) : (
									<>
										{item.icon != null && <span className={styles.icon}>{item.icon}</span>}
										<div className={styles.body}>
											<Text
												tag="span"
												size="inherit"
												lineHeight="tight"
												weight={item.selected ? "medium" : "normal"}
												truncate
											>
												{item.label}
											</Text>
											{item.description != null && (
												<Text
													tag="span"
													size="xs"
													type="secondary"
													className={styles.description}
												>
													{item.description}
												</Text>
											)}
										</div>
									</>
								)}
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>

			{/* Outside the list: a listbox may own only options and groups. */}
			{belowMinimum && (
				<div role="status" className={cx("popover-menu--status", styles.status, textClassName({ size: "sm" }))}>
					<Text tag="div" size="inherit" type="secondary">
						{copy.formatTypeToSearch?.(minSearchLength)}
					</Text>
				</div>
			)}

			{failed && (
				<div
					role="alert"
					className={cx("popover-menu--error", styles.status, textClassName({ size: "sm" }))}
					onKeyDown={keepKeysOutOfList}
				>
					<Text tag="div" size="inherit" type="error">
						{error === true ? copy.error : error}
					</Text>
					{onRetry && (
						<Button type="button" tone="neutral" appearance="outline" onClick={onRetry}>
							<RotateCcwIcon />
							{copy.retry}
						</Button>
					)}
				</div>
			)}

			{footer != null && (
				<div
					className={cx("popover-menu--footer", styles.band, styles.footer)}
					onKeyDown={keepKeysOutOfList}
				>
					{footer}
				</div>
			)}
		</Command>
	)
}
