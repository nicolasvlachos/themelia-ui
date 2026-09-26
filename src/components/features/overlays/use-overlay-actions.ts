/**
 * useOverlayActions: the confirm button's behaviour, resolved once for all three overlays
 * so they agree on what "confirm" means. Paths and precedence: see `OverlayActionProps`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { defaultOverlayActionStrings, type OverlayActionStrings } from "./overlays.strings"
import type { OverlayActionProps, OverlayButtonTone, OverlayTone } from "./overlays.types"

export interface UseOverlayActionsOptions
	extends Pick<
		OverlayActionProps,
		"onConfirm" | "onAsyncConfirm" | "closeOnAsyncComplete" | "confirmTone" | "loading" | "formId" | "onCancel" | "onError"
	> {
	close: () => void
	/** The surface session; closing invalidates an outstanding confirmation. */
	open?: boolean
	strings?: Partial<OverlayActionStrings>
	/** The defaults to start from (a confirmation says "Continue", not "Confirm"). */
	defaults?: OverlayActionStrings
	emphasis?: boolean
	tone?: OverlayTone
}

export interface UseOverlayActionsReturn {
	copy: OverlayActionStrings
	/** True while an async confirm is in flight. */
	pending: boolean
	confirm: () => void | Promise<void>
	cancel: () => void
	confirmTone: OverlayButtonTone
	/** `pending`, or the caller's own `loading`. Both disable the footer. */
	busy: boolean
}

export function useOverlayActions({
	close,
	open = true,
	onConfirm,
	onAsyncConfirm,
	closeOnAsyncComplete = true,
	confirmTone = "primary",
	loading = false,
	formId,
	onCancel,
	onError,
	strings,
	defaults = defaultOverlayActionStrings,
	emphasis = false,
	tone = "neutral",
}: UseOverlayActionsOptions): UseOverlayActionsReturn {
	const copy = { ...defaults, ...strings }
	const [pending, setPending] = useState(false)

	const running = useRef(false)
	const session = useRef(0)
	useEffect(() => {
		// Also protects a reopened surface from the previous session's completion.
		running.current = false
		// oxlint-disable-next-line react/set-state-in-effect -- a new overlay session releases the previous async action state
		setPending(false)
		return () => { session.current += 1; running.current = false }
	}, [open])

	const runConfirm = useCallback(async () => {
		if (loading || running.current || !open) return
		running.current = true
		const current = session.current
		try {
			if (onConfirm) {
				onConfirm()
				close()
			} else if (onAsyncConfirm) {
				setPending(true)
				await onAsyncConfirm()
				if (session.current === current && closeOnAsyncComplete) close()
			} else {
				close()
			}
		} catch (error) {
			if (session.current === current) onError?.(error)
		} finally {
			if (session.current === current) {
				running.current = false
				setPending(false)
			}
		}
	}, [loading, open, onConfirm, onAsyncConfirm, closeOnAsyncComplete, close, onError])

	/** `requestSubmit()`, not `submit()`, which skips constraint validation and the submit handler. */
	const submitForm = useCallback(() => {
		if (!formId || loading || running.current || !open) return
		const form = document.getElementById(formId)
		if (form instanceof HTMLFormElement) form.requestSubmit()
	}, [formId, loading, open])

	const cancel = useCallback(() => {
		if (loading || running.current || !open) return
		onCancel?.()
		close()
	}, [onCancel, close, loading, open])

	const resolvedTone = useMemo<OverlayButtonTone>(() => {
		if (!emphasis) return confirmTone
		// Info and neutral have no button tone of their own; they keep the caller's.
		if (tone === "destructive" || tone === "warning" || tone === "success") return tone
		return confirmTone
	}, [emphasis, tone, confirmTone])

	return {
		copy,
		pending,
		confirm: formId ? submitForm : runConfirm,
		cancel,
		confirmTone: resolvedTone,
		busy: pending || loading,
	}
}
