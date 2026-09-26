import { useEffect, useRef } from "react"

export interface UseCommandShortcutOptions {
	/** The key, without the modifier — "k" for ⌘K. */
	key: string
	enabled?: boolean
	onTrigger?: () => void
	preventDefault?: boolean
}

/**
 * Binds a ⌘/Ctrl shortcut while mounted. The app opts in; the palette never seizes ⌘K
 * on its own.
 */
export function useCommandShortcut({
	key,
	enabled = true,
	onTrigger,
	preventDefault = true,
}: UseCommandShortcutOptions) {
	/* Read from a ref, so an inline `onTrigger` does not re-add the listener each render. */
	const handlerRef = useRef(onTrigger)
	useEffect(() => {
		handlerRef.current = onTrigger
	}, [onTrigger])

	useEffect(() => {
		if (!enabled || typeof document === "undefined") return

		const onKeyDown = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) return
			if (event.key.toLowerCase() !== key.toLowerCase()) return
			if (preventDefault) event.preventDefault()
			handlerRef.current?.()
		}

		document.addEventListener("keydown", onKeyDown)
		return () => document.removeEventListener("keydown", onKeyDown)
	}, [enabled, key, preventDefault])
}
