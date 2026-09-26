/**
 * Tabs, following the WAI-ARIA tabs pattern: arrows, Home and End move between tabs, and
 * only the selected tab is in the tab sequence.
 */
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { ScrollArea } from "@/components/base/display"
import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import { mediaQueryMatches, observeResize } from "@/lib/observers"
import { readScrollEdges } from "@/lib/scroll-edges"
import { resolveStrings } from "@/lib/strings"
import { defaultTabListStrings, type TabListStrings } from "./navigation.strings"

import styles from "./navigation.module.css"

type TabsContextValue = {
	value: string
	setValue: (value: string) => void
	id: string
	/** Values that have a `TabPanel` in the tree, whether or not it is the one showing. */
	panels: ReadonlySet<string>
	registerPanel: (value: string) => () => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs(part: string) {
	const context = React.useContext(TabsContext)
	if (!context) throw new Error(`<${part}> must be used within <Tabs>`)
	return context
}

export interface TabsProps extends Omit<React.ComponentProps<"div">, "onChange"> {
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
}

export function Tabs({
	value,
	defaultValue = "",
	onValueChange,
	className,
	children,
	...props
}: TabsProps) {
	const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
	const isControlled = value !== undefined
	const current = isControlled ? value : uncontrolled
	const id = React.useId()

	const setValue = React.useCallback(
		(next: string) => {
			if (!isControlled) setUncontrolled(next)
			onValueChange?.(next)
		},
		[isControlled, onValueChange],
	)

	// Values with a registered panel, so a tab never claims one that is not there (Tabs as a plain switch).
	const [panels, setPanels] = React.useState<ReadonlySet<string>>(() => new Set())

	const registerPanel = React.useCallback((panel: string) => {
		setPanels((previous) => {
			const next = new Set(previous)
			next.add(panel)
			return next
		})
		return () =>
			setPanels((previous) => {
				const next = new Set(previous)
				next.delete(panel)
				return next
			})
	}, [])

	const context = React.useMemo(
		() => ({ value: current, setValue, id, panels, registerPanel }),
		[current, setValue, id, panels, registerPanel],
	)

	return (
		<TabsContext.Provider value={context}>
			<div data-slot="tabs" className={cx("tabs--component", styles.tabs, className)} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	)
}

const listVariants = cvm(styles.tabList, {
	variants: {
		variant: {
			underline: undefined,
			enclosed: styles.tabListEnclosed,
			pill: styles.tabsPill,
		},
	},
	defaultVariants: { variant: "underline" },
})

export interface TabListProps extends React.ComponentProps<"div"> {
	/**
	 * Structural presentation: a rule with an indicator, a tinted rail, or — for a row that
	 * picks what one list shows rather than switching panels — filled chips with no rule.
	 */
	variant?: "underline" | "enclosed" | "pill"
	/** Accessible name for the tab set. */
	label?: string
	/** Fade edges with hidden tabs. Defaults to false; follows scroll position and direction. */
	edgeFade?: boolean
	/** Accessible names for the automatic overflow scroll controls. */
	strings?: Partial<TabListStrings>
}

export function TabList({ variant, label, edgeFade = false, strings, className, children, ref, onKeyDown: onKeyDownProp, onScroll, id, ...props }: TabListProps) {
	const listRef = React.useRef<HTMLDivElement>(null)
	const railRef = React.useRef<HTMLDivElement>(null)
	const generatedId = React.useId()
	const listId = id ?? generatedId
	const { value } = useTabs("TabList")
	const copy = resolveStrings(defaultTabListStrings, strings)
	const [edges, setEdges] = React.useState({ overflow: false, previous: false, next: false })
	React.useImperativeHandle(ref, () => listRef.current!)

	const measure = React.useCallback(() => {
		const list = listRef.current
		const rail = railRef.current
		if (!list || !rail) return
		const style = getComputedStyle(list)
		// Compare against the space without arrows, so they disappear again on resize.
		const available = rail.clientWidth - (parseFloat(style.marginLeft) || 0) - (parseFloat(style.marginRight) || 0)
		const overflow = list.scrollWidth > available + 1
		const { start, end } = readScrollEdges(list)
		const next = { overflow, previous: start, next: end }
		setEdges(old => old.overflow === next.overflow && old.previous === next.previous && old.next === next.next ? old : next)
	}, [])

	const revealSelected = React.useCallback(() => {
		const list = listRef.current
		const selected = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
		if (!list || !selected) return
		const viewport = list.getBoundingClientRect()
		const tab = selected.getBoundingClientRect()
		const style = getComputedStyle(list)
		// Clear of the fade as well as the padding.
		const fade = edgeFade ? parseFloat(style.scrollPaddingInlineStart) || 0 : 0
		const left = viewport.left + (parseFloat(style.paddingLeft) || 0) + fade
		const right = viewport.right - (parseFloat(style.paddingRight) || 0) - fade
		// Scroll this row only: scrollIntoView also moves the page and enclosing overlays.
		if (tab.left < left) list.scrollLeft += tab.left - left
		else if (tab.right > right) list.scrollLeft += tab.right - right
		measure()
	}, [edgeFade, measure])

	React.useEffect(() => {
		const list = listRef.current
		const rail = railRef.current
		if (!list || !rail) return
		const resize = () => { measure(); revealSelected() }
		const stop = observeResize([rail, list, ...list.children], resize)
		resize()
		return stop
	}, [children, measure, revealSelected])

	React.useEffect(revealSelected, [value, edges.overflow, revealSelected])

	const scroll = (direction: number) => {
		const list = listRef.current
		if (!list) return
		const sign = getComputedStyle(list).direction === "rtl" ? -1 : 1
		list.scrollBy({ left: direction * sign * list.clientWidth * 0.75, behavior: mediaQueryMatches("(prefers-reduced-motion: reduce)") ? "instant" : "smooth" })
	}

	/** Roving focus: arrows move selection, which moves focus with it. */
	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDownProp?.(event)
		if (event.defaultPrevented) return
		const keys = ["ArrowLeft", "ArrowRight", "Home", "End"]
		if (!keys.includes(event.key)) return

		const tabs = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [])]
		if (tabs.length === 0) return

		const index = tabs.indexOf(document.activeElement as HTMLButtonElement)
		let next = index
		const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = index <= 0 ? tabs.length - 1 : index - 1
		else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = index === tabs.length - 1 ? 0 : index + 1
		else if (event.key === "Home") next = 0
		else if (event.key === "End") next = tabs.length - 1

		event.preventDefault()
		tabs[next]?.focus({ preventScroll: true })
		tabs[next]?.click()
	}

	return (
		<div ref={railRef} className={cx("tabs--rail", styles.tabRail)}>
			{edges.overflow && <Button iconOnly tone="neutral" buttonStyle="ghost" className={styles.tabScroll} aria-label={copy.previous} aria-controls={listId} disabled={!edges.previous} onClick={() => scroll(-1)}><ChevronLeftIcon /></Button>}
			<ScrollArea
				ref={listRef}
				id={listId}
				tabIndex={-1}
				role="tablist"
				aria-label={label}
				data-slot="tab-list"
				data-fade-start={edgeFade && edges.overflow && edges.previous ? "" : undefined}
				data-fade-end={edgeFade && edges.overflow && edges.next ? "" : undefined}
				className={cx("tabs--list", listVariants({ variant }), className)}
				onKeyDown={onKeyDown}
				onScroll={event => { measure(); onScroll?.(event) }}
				{...props}
			>
				{children}
			</ScrollArea>
			{edges.overflow && <Button iconOnly tone="neutral" buttonStyle="ghost" className={styles.tabScroll} aria-label={copy.next} aria-controls={listId} disabled={!edges.next} onClick={() => scroll(1)}><ChevronRightIcon /></Button>}
		</div>
	)
}

export interface TabProps extends Omit<React.ComponentProps<"button">, "value"> {
	value: string
}

export function Tab({ value, className, onClick, ...props }: TabProps) {
	const { value: current, setValue, id, panels } = useTabs("Tab")
	const selected = current === value

	// `aria-controls` only when the panel element exists: the selected tab, with a registered panel.
	const controls = selected && panels.has(value) ? `${id}-panel-${value}` : undefined

	return (
		<button
			type="button"
			role="tab"
			id={`${id}-tab-${value}`}
			aria-selected={selected}
			aria-controls={controls}
			// Only the selected tab is tabbable; the rest are reached with arrows.
			tabIndex={selected ? 0 : -1}
			data-slot="tab"
			className={cx("tabs--tab", styles.tab, className)}
			onClick={(event) => {
				onClick?.(event)
				if (!event.defaultPrevented) setValue(value)
			}}
			{...props}
		/>
	)
}

export interface TabPanelProps extends React.ComponentProps<"div"> {
	value: string
}

export function TabPanel({ value, className, children, ...props }: TabPanelProps) {
	const { value: current, id, registerPanel } = useTabs("TabPanel")

	// Registered even while hidden (effects still run when rendering null).
	React.useEffect(() => registerPanel(value), [registerPanel, value])

	if (current !== value) return null

	return (
		<div
			role="tabpanel"
			id={`${id}-panel-${value}`}
			aria-labelledby={`${id}-tab-${value}`}
			// Focusable so keyboard users land in the panel after leaving the tablist.
			tabIndex={0}
			data-slot="tab-panel"
			className={cx("tabs--panel", styles.tabPanel, className)}
			{...props}
		>
			{children}
		</div>
	)
}
