/** A TipTap document with shared toolbar, source mode and composition slots. */
import {
	useCallback, useImperativeHandle, useMemo, useState,
	type ChangeEvent, type Ref,
} from "react"
import {
	BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, QuoteIcon, Redo2Icon,
	StrikethroughIcon, Undo2Icon,
} from "lucide-react"

import { Textarea } from "@/components/base/text-inputs"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	htmlToText, insertHtmlAtCaret, normalizeHtml, readCaretContext, replaceBeforeCaret,
} from "./editor-dom"
import { defaultRichTextEditorStrings } from "./rich-text-editor.strings"
import { EditorCounts, RichTextEditorToolbar } from "./rich-text-editor-toolbar"
import type {
	RichTextEditorHandle, RichTextEditorProps, ToolbarButtonConfig,
} from "./rich-text-editor.types"
import { useEditorDocument } from "./use-editor-document"
import type { RichTextCommand } from "./rich-text-engine.types"
import styles from "./rich-text-editor.module.css"


export function RichTextEditor({
	engine,
	value,
	onValueChange,
	placeholder,
	compact = false,
	minHeight,
	maxHeight,
	disabled = false,
	showCounts = false,
	maxLength,
	extraToolbarItems,
	toolbarTrailing,
	footerSlot,
	hideSourceToggle = false,
	autoFocus = false,
	className,
	onCaretChange,
	strings,
	ref,
}: RichTextEditorProps & { ref?: Ref<RichTextEditorHandle> }) {
	const copy = {
		...defaultRichTextEditorStrings,
		...strings,
		toolbar: { ...defaultRichTextEditorStrings.toolbar, ...strings?.toolbar },
		counts: { ...defaultRichTextEditorStrings.counts, ...strings?.counts },
	}

	const [focused, setFocused] = useState(false)
	const [sourceMode, setSourceMode] = useState(false)
	const [sourceDraft, setSourceDraft] = useState({ raw: "", html: "" })
	const editorDocument = useEditorDocument({ engine, value, onValueChange, onCaretChange, disabled, autoFocus, label: copy.editorLabel })
	const { host, editable, current, activeEngine, state: engineState, emit, read, write, noteCaret } = editorDocument
	const documentHtml = normalizeHtml(engineState?.html ?? value)
	// Keep incomplete source typing through parent echoes; external edits replace it.
	const sourceValue = sourceDraft.html === documentHtml ? sourceDraft.raw : documentHtml

	useImperativeHandle(ref, () => ({
		focus: () => current.current?.focus(),
		getHTML: read,
		setHTML: write,
		insertHTML: (html) => {
			if (current.current?.insertHtml) current.current.insertHtml(html)
			else insertHtmlAtCaret(editable.current, html)
			emit()
		},
		isEmpty: () => read() === "",
		clear: () => write(""),
		getCaretContext: () => {
			if (sourceMode) return null
			if (current.current?.getCaretContext) return current.current.getCaretContext()
			return editable.current?.contains(window.getSelection()?.anchorNode ?? null) ? readCaretContext() : null
		},
		replaceBeforeCaret: (length, html) => {
			if (current.current?.replaceBeforeCaret) current.current.replaceBeforeCaret(length, html)
			else replaceBeforeCaret(length, html, emit)
			emit()
		},
	}), [current, editable, emit, read, sourceMode, write])

	const run = useCallback((command: RichTextCommand) => {
		activeEngine?.execute(command)
		emit()
	}, [activeEngine, emit])

	const isActive = useCallback(
		(command: RichTextCommand) => engineState?.active.has(command) ?? false,
		[engineState],
	)

	const buttons = useMemo<ToolbarButtonConfig[]>(
		() => [
			{ id: "bold", icon: BoldIcon, label: copy.toolbar.bold, isActive: () => isActive("bold"), run: () => run("bold") },
			{ id: "italic", icon: ItalicIcon, label: copy.toolbar.italic, isActive: () => isActive("italic"), run: () => run("italic") },
			{ id: "strike", icon: StrikethroughIcon, label: copy.toolbar.strike, isActive: () => isActive("strike"), run: () => run("strike") },
			{ id: "bullet-list", icon: ListIcon, label: copy.toolbar.bulletList, isActive: () => isActive("bulletList"), run: () => run("bulletList") },
			{ id: "ordered-list", icon: ListOrderedIcon, label: copy.toolbar.orderedList, isActive: () => isActive("orderedList"), run: () => run("orderedList") },
			{ id: "blockquote", icon: QuoteIcon, label: copy.toolbar.blockquote, isActive: () => isActive("blockquote"), run: () => run("blockquote") },
			{
				id: "undo",
				icon: Undo2Icon,
				label: copy.toolbar.undo,
				isActive: () => false,
				run: () => run("undo"),
				disabled: engineState ? !engineState.canUndo : undefined,
			},
			{
				id: "redo",
				icon: Redo2Icon,
				label: copy.toolbar.redo,
				isActive: () => false,
				run: () => run("redo"),
				disabled: engineState ? !engineState.canRedo : undefined,
			},
		],
		[copy.toolbar, run, isActive, engineState],
	)

	const toggleSourceMode = useCallback(() => {
		if (!sourceMode) {
			const html = read()
			setSourceDraft({ raw: html, html })
		}
		setSourceMode((previous) => !previous)
	}, [read, sourceMode])

	const handleSourceChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
		const next = event.target.value
		write(next)
		setSourceDraft({ raw: next, html: read() })
	}, [read, write])

	const bodyStyle = useMemo(
		() => ({
			minHeight: minHeight ?? (compact ? "var(--editor-min-h-compact)" : "var(--editor-min-h)"),
			...(maxHeight ? { maxHeight, overflowY: "auto" as const } : {}),
		}),
		[compact, maxHeight, minHeight],
	)

	/* Both derived from the controlled `value`, not read from the DOM during render. */
	const empty = normalizeHtml(value) === ""
	const text = htmlToText(sourceMode ? sourceValue : normalizeHtml(value))

	return (
		<div
			data-slot="rich-text-editor"
			data-compact={compact || undefined}
			data-disabled={disabled || undefined}
			className={cx("rich-text-editor--component", styles.root, className)}
		>
			<RichTextEditorToolbar
				buttons={buttons}
				extraToolbarItems={extraToolbarItems}
				hideSourceToggle={hideSourceToggle}
				sourceMode={sourceMode}
				toggleSourceMode={toggleSourceMode}
				disabled={disabled}
				toolbarTrailing={toolbarTrailing}
				strings={copy}
			/>

			{sourceMode && (
				<Textarea
					aria-label={copy.sourceLabel}
					value={sourceValue}
					onChange={handleSourceChange}
					disabled={disabled}
					spellCheck={false}
					className={styles.source}
					style={bodyStyle}
				/>
			)}
			<div className={styles.bodyWrap} style={bodyStyle} hidden={sourceMode}>
				{!!placeholder && empty && !focused && (
					<Text type="secondary" className={styles.placeholder}>
						{placeholder}
					</Text>
				)}
				<div
					ref={host}
					className={styles.mount}
					onInput={emit}
					onKeyUp={noteCaret}
					onMouseUp={noteCaret}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
				/>
			</div>

			{!!footerSlot && <div className={styles.footerSlot}>{footerSlot}</div>}
			{showCounts && <EditorCounts text={text} maxLength={maxLength} strings={copy} />}
		</div>
	)
}
