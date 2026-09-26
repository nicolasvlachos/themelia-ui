/**
 * MentionInlineSuggestions: the panel for the inline-trigger flow. Not a popover: the
 * editor keeps focus and the caret, so `onMouseDown` prevents default (the click still
 * lands). The consumer wraps the editor in a relatively positioned element; this pins
 * itself below it.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

import { Text } from "@/components/base/typography"

import { cx } from "@/lib/cx"

import {
	defaultMentionInlineSuggestionsStrings,
	type MentionInlineSuggestionsStrings,
} from "./mentions.strings"
import { MentionKindTabs, MentionRows } from "./mention-suggestion-list"
import type { MentionResource, MentionSuggestion } from "./mentions.types"
import styles from "./mentions.module.css"

export interface MentionInlineSuggestionsProps<TResource extends string = string> {
	open: boolean
	activeKind: TResource | null
	setActiveKind: (kind: TResource | null) => void
	kinds: ReadonlyArray<TResource>
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	/** Every kind's rows, for the tab counts. */
	suggestionsByKind?: Readonly<Record<string, ReadonlyArray<MentionSuggestion<TResource>>>>
	/** The active kind's rows. */
	suggestions: ReadonlyArray<MentionSuggestion<TResource>>
	loading: boolean
	/** Echoed in the header; the consumer owns the input. */
	query?: string
	/** Fires when the writer picks a tab, so the hook can stop auto-switching. */
	onManualKindChange?: () => void
	onSelect: (suggestion: MentionSuggestion<TResource>) => void
	/** Escape or leaving the editor dismisses the current completion session. */
	onDismiss?: () => void
	strings?: Partial<MentionInlineSuggestionsStrings>
	className?: string
}

export function MentionInlineSuggestions<TResource extends string = string>({
	open,
	activeKind,
	setActiveKind,
	kinds,
	resources,
	suggestionsByKind,
	suggestions,
	loading,
	query,
	onManualKindChange,
	onSelect,
	onDismiss,
	strings,
	className,
}: MentionInlineSuggestionsProps<TResource>) {
	const copy = { ...defaultMentionInlineSuggestionsStrings, ...strings }
	const panelRef = useRef<HTMLDivElement>(null)
	const [placement, setPlacement] = useState<"bottom" | "top">("bottom")
	const listId = useId()
	const listKey = `${activeKind}:${query ?? ""}:${suggestions.map(entry => entry.id).join(",")}`
	const [selection, setSelection] = useState({ key: "", index: 0 })
	const [dismissed, setDismissed] = useState<string | null>(null)
	const visible = open && dismissed !== listKey
	const activeIndex = selection.key === listKey ? Math.min(selection.index, Math.max(0, suggestions.length - 1)) : 0

	if (!open && dismissed !== null) setDismissed(null)

	useEffect(() => {
		if (!visible) return
		const editor = panelRef.current?.ownerDocument.activeElement as HTMLElement | null
		if (!editor?.matches("[contenteditable=true], textarea, input")) return
		const attributes = { "aria-controls": listId, "aria-autocomplete": "list", "aria-activedescendant": suggestions.length && !loading ? `${listId}-${activeIndex}` : "" }
		const previous = Object.fromEntries(Object.keys(attributes).map(key => [key, editor.getAttribute(key)]))
		for (const [key, value] of Object.entries(attributes)) editor.setAttribute(key, value)
		const dismiss = () => { setDismissed(listKey); onDismiss?.() }
		const keydown = (event: KeyboardEvent) => {
			if (event.isComposing || event.keyCode === 229) return
			if (event.key === "Escape") {
				event.preventDefault(); event.stopPropagation(); dismiss(); return
			}
			if (loading || suggestions.length === 0) return
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault(); event.stopPropagation()
				const index = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length
				setSelection({ key: listKey, index })
				panelRef.current?.querySelectorAll("[role=option]")[index]?.scrollIntoView({ block: "nearest" })
			} else if (event.key === "Enter") {
				const suggestion = suggestions[activeIndex]
				if (suggestion) { event.preventDefault(); event.stopPropagation(); onSelect(suggestion) }
			}
		}
		editor.addEventListener("keydown", keydown, true)
		editor.addEventListener("blur", dismiss)
		return () => {
			editor.removeEventListener("keydown", keydown, true)
			editor.removeEventListener("blur", dismiss)
			for (const [key, value] of Object.entries(previous)) {
				if (value === null) editor.removeAttribute(key)
				else editor.setAttribute(key, value)
			}
		}
	}, [visible, activeIndex, listId, listKey, loading, onDismiss, onSelect, suggestions])

	/*
	 * Flip above the anchor when clipped below and there is more room above. There is no
	 * portal (the panel scrolls with its editor), so this measures before paint.
	 */
	useLayoutEffect(() => {
		// oxlint-disable-next-line react/set-state-in-effect -- placement is measured from PAINTED layout (offsetHeight against the viewport); it cannot be known before the browser has laid the panel out
		if (!visible) { setPlacement("bottom"); return }
		const el = panelRef.current
		if (!el) return
		const measure = () => {
			const anchor = el.offsetParent as HTMLElement | null
			if (!anchor) return
			const a = anchor.getBoundingClientRect()
			const height = el.offsetHeight
			const viewport = window.visualViewport
			const top = viewport?.offsetTop ?? 0
			const below = top + (viewport?.height ?? window.innerHeight) - a.bottom
			const above = a.top - top
			const next = height > below && above > below ? "top" : "bottom"
			setPlacement(next)
			/* The panel's gap to the editor (`--space-xs`, on whichever side it sits), kept again at the viewport edge. */
			const style = getComputedStyle(el)
			const gap = (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0)
			el.style.setProperty("--mention-available-height", `${Math.max(0, (next === "top" ? above : below) - gap * 2)}px`)
		}
		measure()
		window.addEventListener("resize", measure)
		window.addEventListener("scroll", measure, true)
		const observer = new ResizeObserver(measure)
		observer.observe(el)
		window.visualViewport?.addEventListener("resize", measure)
		return () => {
			window.removeEventListener("resize", measure)
			window.removeEventListener("scroll", measure, true)
			observer.disconnect()
			window.visualViewport?.removeEventListener("resize", measure)
		}
	}, [visible, suggestions, activeKind])

	if (!visible) return null

	return (
		<div
			ref={panelRef}
			data-placement={placement}
			// Keeps the caret in the editor through a click.
			onMouseDown={(event) => event.preventDefault()}
			className={cx("mention-inline-suggestions--component", styles.panel, styles.panelInline, className)}
		>
			<div className={styles.panelHeader}>
				<div className="sr-only">
					<Text size="xs" weight="medium" type="secondary">{copy.title}</Text>
					{!!query && (
						<Text size="xs" type="secondary" className={styles.panelQuery}>
							{copy.formatQuery(query)}
						</Text>
					)}
				</div>
				<MentionKindTabs
					focusable={false}
					kinds={kinds}
					activeKind={activeKind}
					resources={resources}
					suggestionsByKind={suggestionsByKind}
					onSelect={(kind) => {
						setActiveKind(kind)
						onManualKindChange?.()
					}}
				/>
			</div>

			<MentionRows
				id={listId}
				resources={resources}
				focusable={false}
				activeIndex={activeIndex}
				onActiveIndexChange={index => setSelection({ key: listKey, index })}
				suggestions={suggestions}
				activeKind={activeKind}
				loading={loading}
				loadingLabel={copy.loading}
				emptyLabel={copy.empty}
				listLabel={copy.listLabel}
				onSelect={onSelect}
			/>
		</div>
	)
}
