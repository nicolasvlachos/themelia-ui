import { useCallback, useImperativeHandle, useRef, useState, type Ref } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Popover, PopoverTrigger } from "themelia-ui/base/popover"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	MentionChip, MentionInlineSuggestions, MentionPicker, parseMentionsFromHtml, useMentions,
	type MentionEditorHandle,
} from "themelia-ui/features/mentions"

import styles from "../../preview.module.css"
import { RESOURCES, type Kind } from "./data"

/**
 * The four methods `MentionEditorHandle` asks for, over a plain contenteditable.
 *
 * Deliberately minimal — the point is that any editor implementing these plugs in, not
 * that the kit ships one. `replaceBeforeCaret` is the interesting one: it EXTENDS the
 * selection backwards and replaces in a single command, so the caret never visits an
 * in-between state and the browser's own undo stack gets one entry rather than two.
 */
function MiniEditor({
	handleRef,
	onCaretChange,
	onInput,
	placeholder,
}: {
	handleRef: Ref<MentionEditorHandle | null>
	onCaretChange: () => void
	onInput: (html: string) => void
	placeholder: string
}) {
	const host = useRef<HTMLDivElement>(null)

	useImperativeHandle(handleRef, () => ({
		getCaretContext() {
			const selection = window.getSelection()
			if (!selection?.focusNode || !host.current?.contains(selection.focusNode)) return null
			const range = document.createRange()
			range.setStart(host.current, 0)
			range.setEnd(selection.focusNode, selection.focusOffset)
			return { textBefore: range.toString() }
		},
		insertHTML(html) {
			host.current?.focus()
			document.execCommand("insertHTML", false, html)
			onInput(host.current?.innerHTML ?? "")
		},
		replaceBeforeCaret(length, html) {
			host.current?.focus()
			const selection = window.getSelection()
			if (selection && selection.rangeCount > 0) {
				// Extend back over the trigger and needle, then replace both at once.
				for (let step = 0; step < length; step += 1) {
					selection.modify("extend", "backward", "character")
				}
			}
			document.execCommand("insertHTML", false, html)
			onInput(host.current?.innerHTML ?? "")
		},
		focus() {
			host.current?.focus()
		},
	}))

	return (
		<div
			ref={host}
			contentEditable
			suppressContentEditableWarning
			role="textbox"
			aria-multiline
			aria-label={placeholder}
			data-placeholder={placeholder}
			onKeyUp={onCaretChange}
			onMouseUp={onCaretChange}
			onInput={(event) => {
				onInput(event.currentTarget.innerHTML)
				onCaretChange()
			}}
			className={styles.miniEditor}
		/>
	)
}

export default function MentionInline() {
	const editorRef = useRef<MentionEditorHandle | null>(null)
	const [html, setHtml] = useState("")
	const mentions = useMentions<Kind>({ resources: RESOURCES, editorRef })

	/*
	 * The body is the source of truth for which mentions survive. When the writer
	 * backspaces a chip out, the list has to shrink with it — otherwise the comment
	 * notifies someone whose name is no longer in it.
	 */
	const handleInput = useCallback(
		(next: string) => {
			setHtml(next)
			const present = new Set(parseMentionsFromHtml<Kind>(next).map((m) => m.id))
			// The updater form, not `mentions.mentions`: this fires in the same tick as the
			// insertion, so the render's list does not yet contain the mention just added.
			mentions.setMentions((prev) => prev.filter((m) => present.has(m.id)))
		},
		[mentions],
	)

	return (
		<>
			<div className={styles.mentionAnchor}>
				<MiniEditor
					handleRef={editorRef}
					onCaretChange={mentions.handleCaretChange}
					onInput={handleInput}
					placeholder="Write a note — try @, # or !"
				/>
				<MentionInlineSuggestions
					onDismiss={() => mentions.setPickerOpen(false)}
					open={mentions.triggerActive && mentions.pickerOpen}
					activeKind={mentions.activeKind}
					setActiveKind={mentions.setActiveKind}
					kinds={mentions.kinds}
					resources={RESOURCES}
					suggestionsByKind={mentions.suggestionsByKind}
					suggestions={mentions.suggestions}
					loading={mentions.isLoading}
					query={mentions.query}
					onManualKindChange={() => mentions.setManualKindOverride(true)}
					onSelect={mentions.pickSuggestion}
				/>
			</div>

			<Stack direction="horizontal" gap="md" align="center" wrap>
				<Popover open={mentions.pickerOpen && !mentions.triggerActive} onOpenChange={mentions.setPickerOpen}>
					<PopoverTrigger
						render={
							<Button tone="neutral" buttonStyle="outline">
								Insert reference
							</Button>
						}
					/>
					<MentionPicker
						open={mentions.pickerOpen && !mentions.triggerActive}
						activeKind={mentions.activeKind}
						setActiveKind={mentions.setActiveKind}
						kinds={mentions.kinds}
						resources={RESOURCES}
						suggestionsByKind={mentions.suggestionsByKind}
						query={mentions.query}
						setQuery={mentions.setQuery}
						suggestions={mentions.suggestions}
						loading={mentions.isLoading}
						onSelect={mentions.pickSuggestion}
					/>
				</Popover>
				<Text size="sm" type="secondary">
					{mentions.mentions.length} reference{mentions.mentions.length === 1 ? "" : "s"} in this draft
				</Text>
			</Stack>

			{/* `align="center"`: a flex item blockifies, so without it the chips stretch. */}
			{mentions.mentions.length > 0 && (
				<Stack direction="horizontal" gap="sm" align="center" wrap>
					{mentions.mentions.map((mention) => (
						<MentionChip
							key={mention.id}
							mention={mention}
							resource={RESOURCES[mention.kind]}
							asLink={false}
						/>
					))}
				</Stack>
			)}

			{!!html && (
				<Text size="xs" type="secondary" className={styles.mentionSource}>
					{html}
				</Text>
			)}
		</>
	)
}
