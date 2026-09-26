/**
 * The parts both mention surfaces share (kind tabs, rows), so `MentionPicker` and
 * `MentionInlineSuggestions` cannot drift apart.
 */
import { useState, type ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { CommandItem } from "@/components/base/command"
import { Item } from "@/components/base/item"
import { Spinner } from "@/components/base/spinner"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import type { MentionResource, MentionSuggestion } from "./mentions.types"
import styles from "./mentions.module.css"

export interface MentionKindTabsProps<TResource extends string = string> {
	kinds: ReadonlyArray<TResource>
	activeKind: TResource | null
	onSelect: (kind: TResource) => void
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	/** Row counts per kind, so a tab can say how many matches are behind it. */
	suggestionsByKind?: Readonly<Record<string, ReadonlyArray<MentionSuggestion<TResource>>>>
	/** Inline completion keeps all keyboard focus in the editor. */
	focusable?: boolean
}

export function MentionKindTabs<TResource extends string = string>({
	kinds,
	activeKind,
	onSelect,
	resources,
	suggestionsByKind,
	focusable = true,
}: MentionKindTabsProps<TResource>) {
	// One kind is not a choice: no tabs.
	if (kinds.length <= 1) return null

	return (
		<div className={cx("mention-kind-tabs--component", styles.tabs)} role="tablist">
			{kinds.map((kind) => {
				const config = resources?.[kind]
				const active = kind === activeKind
				const count = suggestionsByKind?.[kind]?.length ?? 0

				return (
					<button
						key={kind}
						type="button"
						role="tab"
						aria-selected={active}
						tabIndex={focusable && active ? 0 : -1}
						onKeyDown={event => {
							if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
							event.preventDefault()
							const index = kinds.indexOf(kind)
							const next = event.key === "Home" ? 0 : event.key === "End" ? kinds.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + kinds.length) % kinds.length
							const nextKind = kinds[next]
							if (nextKind !== undefined) onSelect(nextKind)
							;(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next])?.focus()
						}}
						/* `data-empty`, not hidden: the writer may be about to type a match for it. */
						data-active={active || undefined}
						data-empty={count === 0 || undefined}
						onClick={() => onSelect(kind)}
						className={styles.tab}
					>
						<Text tag="span" weight="medium" type="inherit">
							{config?.label ?? String(kind)}
						</Text>
						{count > 0 && (
							<Text tag="span" size="xs" weight="medium" type="inherit" numeric>
								{count}
							</Text>
						)}
					</button>
				)
			})}
		</div>
	)
}

export interface MentionRowsProps<TResource extends string = string> {
	suggestions: ReadonlyArray<MentionSuggestion<TResource>>
	activeKind: TResource | null
	loading: boolean
	loadingLabel: string
	emptyLabel: ReactNode
	listLabel: string
	onSelect: (suggestion: MentionSuggestion<TResource>) => void
	className?: string
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	/** Use registered Command items inside an existing Command/CommandList. */
	command?: boolean
	activeIndex?: number
	onActiveIndexChange?: (index: number) => void
	focusable?: boolean
	/** Connects an inline editor to its active suggestion. */
	id?: string
}

export function MentionRows<TResource extends string = string>({
	suggestions,
	activeKind,
	loading,
	loadingLabel,
	emptyLabel,
	listLabel,
	onSelect,
	className,
	resources,
	command = false,
	activeIndex,
	onActiveIndexChange,
	focusable = true,
	id,
}: MentionRowsProps<TResource>) {
	const [localIndex, setLocalIndex] = useState(0)
	const selected = Math.min(activeIndex ?? localIndex, Math.max(0, suggestions.length - 1))
	const selectIndex = (index: number) => { setLocalIndex(index); onActiveIndexChange?.(index) }
	if (loading) {
		return (
			<div id={id} className={cx("mention-rows--component", styles.list, styles.listState, className)}>
				<Spinner label={loadingLabel} />
			</div>
		)
	}

	if (suggestions.length === 0) {
		return (
			<div id={id} role="status" className={cx("mention-rows--component", styles.list, styles.listState, className)}>
				<Text type="secondary">{emptyLabel}</Text>
			</div>
		)
	}

	return (
		<div id={id} role={command ? undefined : "listbox"} aria-label={command ? undefined : listLabel} className={cx("mention-rows--component", styles.list, className)}>
			{suggestions.map((suggestion, index) => {
				const kind = suggestion.kind ?? activeKind ?? ""
				const Icon = suggestion.icon ?? resources?.[kind as TResource]?.icon
				const content = <>
						{suggestion.avatar ? <Avatar size="sm"><AvatarImage src={suggestion.avatar} alt="" /><AvatarFallback>{suggestion.label.slice(0, 1)}</AvatarFallback></Avatar> : !!Icon && <Icon className={styles.rowIcon} />}
						<span className={styles.rowText}>
							<Text tag="span" weight="medium" truncate>
								{suggestion.label}
							</Text>
							{!!suggestion.description && (
								<Text tag="span" size="xs" type="secondary" truncate>
									{suggestion.description}
								</Text>
							)}
						</span>
					</>
				const key = `${kind}:${suggestion.id}`
				if (command) return <CommandItem key={key} value={key} onSelect={() => onSelect(suggestion)} className={styles.row} data-suggestion-id={key}>{content}</CommandItem>
				return <Item key={key} id={id ? `${id}-${index}` : undefined} render={<button type="button" />} role="option" aria-selected={selected === index} tabIndex={focusable && selected === index ? 0 : -1} data-suggestion-id={key} className={styles.row}
					onPointerMove={() => selectIndex(index)}
					onFocus={() => selectIndex(index)}
					onClick={() => onSelect(suggestion)}
					onKeyDown={event => {
						if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
						event.preventDefault()
						const next = (index + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length
						selectIndex(next)
						;(event.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[role=option]")[next])?.focus()
					}}>{content}</Item>
			})}
		</div>
	)
}
