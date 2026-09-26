import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

import { normalizeHtml, toEditorContent } from "./editor-dom"
import type { RichTextEngine } from "./rich-text-engine.types"
import { createTiptapEngine } from "./tiptap/tiptap-engine"
import styles from "./rich-text-editor.module.css"

/** Own the engine's lifetime; supplied engines remain owned by their caller. */
export function useEditorDocument({ engine, value, onValueChange, onCaretChange, disabled, autoFocus, label }: {
	engine?: RichTextEngine
	value: string
	onValueChange: (html: string) => void
	onCaretChange?: () => void
	disabled: boolean
	autoFocus: boolean
	label: string
}) {
	const host = useRef<HTMLDivElement>(null)
	const editable = useRef<HTMLElement | null>(null)
	const current = useRef<RichTextEngine | null>(null)
	const callbacks = useRef({ onValueChange, onCaretChange })
	const latestValue = useRef(value)
	const appliedValue = useRef(value)
	const lastHtml = useRef(normalizeHtml(value))
	const syncing = useRef(false)
	const [activeEngine, setActiveEngine] = useState<RichTextEngine | null>(null)

	useEffect(() => {
		callbacks.current = { onValueChange, onCaretChange }
		latestValue.current = value
	})

	const emit = useCallback(() => {
		if (syncing.current) return
		const html = normalizeHtml(current.current?.getState().html ?? editable.current?.innerHTML ?? "")
		if (html !== lastHtml.current) {
			lastHtml.current = html
			callbacks.current.onValueChange(html)
		}
		callbacks.current.onCaretChange?.()
	}, [])

	useEffect(() => {
		const node = host.current
		if (!node) return
		const documentEngine = engine ?? createTiptapEngine({ element: node, content: latestValue.current })
		// Older custom engines use the host itself as their contenteditable.
		const surface = documentEngine.mount?.(node) ?? node
		if (!documentEngine.mount) {
			surface.innerHTML = toEditorContent(latestValue.current)
			documentEngine.setHtml(latestValue.current)
		} else if (engine) {
			documentEngine.setHtml(latestValue.current)
		}
		current.current = documentEngine
		editable.current = surface
		lastHtml.current = normalizeHtml(documentEngine.getState().html)
		appliedValue.current = latestValue.current
		const unsubscribe = documentEngine.subscribe(emit)
		setActiveEngine(documentEngine)
		return () => {
			unsubscribe()
			current.current = null
			editable.current = null
			if (engine) documentEngine.unmount?.()
			else documentEngine.destroy()
		}
	}, [engine, emit])

	useEffect(() => {
		const node = editable.current
		if (!node) return
		node.classList.add(styles.body)
		node.setAttribute("role", "textbox")
		node.setAttribute("aria-label", label)
		node.setAttribute("aria-multiline", "true")
		node.setAttribute("aria-disabled", String(disabled))
		if (activeEngine?.setEditable) activeEngine.setEditable(!disabled)
		else node.contentEditable = String(!disabled)
	}, [activeEngine, disabled, label])

	useEffect(() => {
		if (autoFocus && !disabled) activeEngine?.focus()
	}, [activeEngine, autoFocus, disabled])

	useEffect(() => {
		if (!activeEngine || value === appliedValue.current) return
		appliedValue.current = value
		if (normalizeHtml(value) === lastHtml.current) return
		// Parent echoes already match; real external updates go through the model.
		syncing.current = true
		try {
			activeEngine.setHtml(value)
			lastHtml.current = normalizeHtml(activeEngine.getState().html)
		} finally {
			syncing.current = false
		}
	}, [activeEngine, value])

	const state = useSyncExternalStore(
		useCallback((listener: () => void) => activeEngine?.subscribe(listener) ?? (() => {}), [activeEngine]),
		() => activeEngine?.getState() ?? null,
		() => null,
	)

	const read = useCallback(() => normalizeHtml(current.current?.getState().html ?? latestValue.current), [])
	const write = useCallback((html: string) => {
		current.current?.setHtml(html)
		emit()
	}, [emit])
	const noteCaret = useCallback(() => callbacks.current.onCaretChange?.(), [])

	return { host, editable, current, activeEngine, state, emit, read, write, noteCaret }
}
