/**
 * useMentions: the search state plus trigger detection from the text before the caret.
 *
 * - A trigger must follow start-of-line or whitespace (so email addresses do not open it).
 * - The needle is Unicode letters, numbers, `_` and `-`.
 * - The active kind is seeded only on a fresh trigger; later keystrokes keep the writer's tab.
 * - Insertion replaces the trigger range in one call (one undo entry).
 *
 * Any editor implementing `MentionEditorHandle` plugs in; the kit's rich-text editor does.
 */
import { useCallback, useRef, useState } from "react"
import type { RefObject } from "react"

import { buildMentionHtml } from "./mention-html"
import {
	useMentionsSearch,
	type UseMentionsSearchOptions,
	type UseMentionsSearchReturn,
} from "./use-mentions-search"
import type { Mention, MentionSuggestion, MentionsResourceSearch } from "./mentions.types"

/** The whole surface an editor must offer to support mentions. */
export interface MentionEditorHandle {
	/** The text between the start of the block and the caret. `null` when unfocused. */
	getCaretContext(): { textBefore: string } | null
	insertHTML(html: string): void
	/** Selects `length` characters back from the caret and replaces them, atomically. */
	replaceBeforeCaret(length: number, html: string): void
	focus(): void
}

export interface UseMentionsOptions<TResource extends string = string>
	extends UseMentionsSearchOptions<TResource> {
	editorRef?: RefObject<MentionEditorHandle | null>
}

export interface UseMentionsReturn<TResource extends string = string>
	extends UseMentionsSearchReturn<TResource> {
	pickerOpen: boolean
	setPickerOpen: (open: boolean) => void
	/** True while the picker is open because of an inline trigger, not the button. */
	triggerActive: boolean
	/** Wire to the editor's caret-change callback. */
	handleCaretChange: () => void
	/** Registers the mention, writes the chip into the editor, closes the picker. */
	pickSuggestion: (suggestion: MentionSuggestion<TResource>) => Mention<TResource>
}

interface TriggerState {
	kind: string
	triggerChar: string
	/** How many characters back the chip replaces: the trigger plus what was typed. */
	consumedLength: number
}

/** Escapes a trigger character for use inside a character class. */
const escapeForClass = (char: string) => char.replace(/[.*+?^${}()|[\]\\^-]/g, "\\$&")

export function useMentions<TResource extends string = string>(
	options: UseMentionsOptions<TResource> = {},
): UseMentionsReturn<TResource> {
	const { resources, editorRef } = options
	const onResourceSearch: MentionsResourceSearch<TResource> | undefined = options.onResourceSearch

	const search = useMentionsSearch<TResource>({ ...options, resources, onResourceSearch })

	const [pickerOpen, setPickerOpenState] = useState(false)
	const [triggerActive, setTriggerActive] = useState(false)
	const triggerRef = useRef<TriggerState | null>(null)
	/** The trigger char of the current session, so a fresh one can be told from a keystroke. */
	const sessionCharRef = useRef<string | null>(null)
	const dismissedContextRef = useRef<string | null>(null)

	const setPickerOpen = useCallback(
		(open: boolean) => {
			setPickerOpenState(open)
			dismissedContextRef.current = open ? null : editorRef?.current?.getCaretContext()?.textBefore ?? null
			if (!open) {
				triggerRef.current = null
				sessionCharRef.current = null
				setTriggerActive(false)
				search.setManualKindOverride(false)
			}
		},
		[search, editorRef],
	)

	const handleCaretChange = useCallback(() => {
		if (!resources) return

		const triggerToKind: Record<string, string> = {}
		for (const [kind, config] of Object.entries(resources)) {
			const trigger = (config as { trigger?: string } | undefined)?.trigger
			if (typeof trigger === "string" && trigger.length > 0) triggerToKind[trigger] = kind
		}
		if (Object.keys(triggerToKind).length === 0) return

		const context = editorRef?.current?.getCaretContext()
		const dismiss = () => {
			if (triggerRef.current) {
				triggerRef.current = null
				setPickerOpen(false)
			}
		}

		if (!context) {
			dismiss()
			return
		}
		// Caret callbacks follow Escape; reopen only once the caret context changes or the button is used.
		if (dismissedContextRef.current === context.textBefore) return
		dismissedContextRef.current = null

		/* `(?:^|\s)` keeps `hi@example.com` from opening the picker. */
		const triggers = Object.keys(triggerToKind).map(escapeForClass).join("")
		const pattern = new RegExp(`(?:^|\\s)([${triggers}])([\\p{L}\\p{N}_-]*)$`, "u")
		const match = context.textBefore.match(pattern)

		if (!match) {
			dismiss()
			return
		}

		const triggerChar = match[1]!
		const needle = match[2] ?? ""
		const kind = triggerToKind[triggerChar]!

		triggerRef.current = {
			kind,
			triggerChar,
			consumedLength: triggerChar.length + needle.length,
		}
		setTriggerActive(true)

		// A fresh session seeds the kind; a keystroke inside one leaves the tab alone.
		if (sessionCharRef.current !== triggerChar) {
			if (search.activeKind !== kind) search.setActiveKind(kind as TResource)
			search.setManualKindOverride(false)
			sessionCharRef.current = triggerChar
		}

		if (search.query !== needle) search.setQuery(needle)
		setPickerOpenState(true)
	}, [editorRef, resources, search, setPickerOpen])

	const pickSuggestion = useCallback(
		(suggestion: MentionSuggestion<TResource>) => {
			const mention = search.selectSuggestion(suggestion)
			const trigger = triggerRef.current
			const html = buildMentionHtml(mention, {
				triggerChar: trigger?.triggerChar,
				tone: resources?.[mention.kind]?.tone,
			})

			const editor = editorRef?.current
			if (editor) {
				// One operation, so the caret never visits an in-between state.
				if (trigger && trigger.consumedLength > 0) {
					editor.replaceBeforeCaret(trigger.consumedLength, html)
					triggerRef.current = null
				} else {
					// Opened from the button: nothing to replace, so the chip lands at the caret.
					editor.insertHTML(html)
				}
			}

			setPickerOpen(false)
			return mention
		},
		[editorRef, resources, search, setPickerOpen],
	)

	return {
		...search,
		pickerOpen,
		setPickerOpen,
		triggerActive,
		handleCaretChange,
		pickSuggestion,
	}
}
