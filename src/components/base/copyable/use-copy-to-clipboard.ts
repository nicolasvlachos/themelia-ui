import { useCallback, useEffect, useState } from "react"

import { useLatest } from "@/hooks/use-latest"

/**
 * Copy a value, confirm it, and reset — the shared implementation for every copy surface.
 * The window is keyed off a counter, not a boolean: re-setting `true` is a no-op, so a
 * second copy would inherit the first one's remaining window.
 */
export interface UseCopyToClipboardOptions {
	/** How long the confirmation stands, in ms. Defaults to 2000, Copyable's window. */
	confirmMs?: number
	/**
	 * Where the value goes when it is not the platform clipboard — for environments without
	 * `navigator.clipboard` (webviews, insecure origins).
	 */
	write?: (value: string) => void | Promise<void>
	onCopy?: (value: string) => void
	onError?: (error: unknown) => void
}

export interface UseCopyToClipboardResult {
	/** True from the moment the copy succeeds until the window closes. */
	copied: boolean
	/** Resolves `true` when the value was written, `false` when it was not. */
	copy: (value: string) => Promise<boolean>
}

/* One window for every copy surface; Copyable relies on it. */
const DEFAULT_CONFIRM_MS = 2000

export function useCopyToClipboard({
	confirmMs = DEFAULT_CONFIRM_MS,
	write,
	onCopy,
	onError,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult {
	const [copyCount, setCopyCount] = useState(0)
	const [copied, setCopied] = useState(false)

	/*
	 * Callbacks live on a ref so inline arrows don't restart the window and `copy` stays
	 * stable. `useLatest` assigns after commit; they are only read from a click.
	 */
	const latest = useLatest({ write, onCopy, onError })

	/*
	 * The effect owns the window; `copied` is set by the copy itself so it shows in the same
	 * commit. Cleanup stops an unmount mid-window from setting state.
	 */
	useEffect(() => {
		if (copyCount === 0) return
		const timeout = window.setTimeout(() => setCopied(false), confirmMs)
		return () => window.clearTimeout(timeout)
	}, [copyCount, confirmMs])

	const copy = useCallback(async (value: string) => {
		const { write: writer, onCopy: copied_, onError: failed } = latest.current
		try {
			if (writer) await writer(value)
			else if (typeof navigator !== "undefined" && navigator.clipboard) {
				await navigator.clipboard.writeText(value)
			} else {
				/* Named, not silent: a caller can pass `write` for this environment. */
				throw new Error("No clipboard available. Pass `write` to supply one.")
			}
			setCopied(true)
			setCopyCount((count) => count + 1)
			copied_?.(value)
			return true
		} catch (error) {
			failed?.(error)
			return false
		}
	}, [latest])

	return { copied, copy }
}
