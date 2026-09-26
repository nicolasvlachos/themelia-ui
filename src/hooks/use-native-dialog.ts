import * as React from "react"

/** Ref-counted scroll lock: restores only when the last stacked modal closes. */
let scrollLockCount = 0
let scrollLockPrevious = ""

function acquireScrollLock() {
	if (scrollLockCount === 0) {
		// At count zero a `hidden` is a leak (earlier overlay, StrictMode); never restore it.
		const current = document.body.style.overflow
		scrollLockPrevious = current === "hidden" ? "" : current
		document.body.style.overflow = "hidden"
	}
	scrollLockCount += 1
	return () => {
		scrollLockCount -= 1
		if (scrollLockCount === 0) {
			document.body.style.overflow = scrollLockPrevious
		}
	}
}

/** How much of the page the surface takes hostage while it is open. */
export type OverlayModality = boolean | "trap-focus"

export type UseNativeDialogOptions = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/**
	 * `true` — `showModal()`: focus trap, scrim, inert page, scroll lock.
	 * `'trap-focus'` — focus stays inside; the page keeps scroll and pointer events.
	 * `false` — non-modal `show()`; the surface supplies positioning and stacking.
	 */
	modal?: OverlayModality
	/** Allows a backdrop click to dismiss. */
	closeOnBackdropClick?: boolean
	/** Allows Escape to dismiss. `false` for destructive or in-progress work. */
	closeOnEscape?: boolean
	/** Element to focus on open, instead of the first tabbable node. */
	initialFocusRef?: React.RefObject<HTMLElement | null>
}

/**
 * Syncs a controlled `open` prop with a native `<dialog>`, and adds what the element
 * leaves to the author: backdrop-click dismissal, Escape control, a scroll lock, and
 * reporting native closes (Esc, `<form method="dialog">`) through `onClose`.
 *
 * The `close` event is async, so briefly the DOM is closed while React still holds
 * `open: true` and a `setOpen(true)` bails out; `reconcile()` corrects the element directly.
 */
export function useNativeDialog({
	open,
	onOpenChange,
	modal = true,
	closeOnBackdropClick = true,
	closeOnEscape = true,
	initialFocusRef,
}: UseNativeDialogOptions) {
	const ref = React.useRef<HTMLDialogElement>(null)

	// Keep the latest callback without making the effects depend on its identity.
	const onOpenChangeRef = React.useRef(onOpenChange)
	React.useEffect(() => {
		onOpenChangeRef.current = onOpenChange
	}, [onOpenChange])

	const isModal = modal === true
	const trapsFocus = modal !== false

	/** Drive the element to `next`, or to the current prop when called with no argument. */
	const reconcile = React.useCallback(
		(next?: boolean) => {
			const el = ref.current
			if (!el) return
			const target = next ?? open

			if (target && !el.open) {
				// Only `showModal()` gives the top layer, backdrop, trap and inert page.
				if (isModal) el.showModal()
				else el.show()

				// Synchronously, right after the UA's own initial focus, so this one wins.
				const initialFocus = initialFocusRef?.current
				if (initialFocus) initialFocus.focus()
				else if (initialFocusRef && import.meta.env.DEV) {
					console.warn(
						"[useNativeDialog] initialFocusRef was never attached — the component it " +
							"points at is not forwarding its ref to a DOM node.",
					)
				}
			} else if (!target && el.open) {
				el.close()
			}
		},
		[open, isModal, initialFocusRef],
	)

	// Every render, not only on `open` changes: cheap, and repairs drift from a native close.
	React.useEffect(() => {
		reconcile()
	})

	/** Wire to the element's `onClose`. */
	const handleClose = React.useCallback(() => {
		onOpenChangeRef.current?.(false)
	}, [])

	/** Wire to the element's `onCancel`; preventing it implements `closeOnEscape: false`. */
	const handleCancel = React.useCallback(
		(event: React.SyntheticEvent<HTMLDialogElement>) => {
			if (!closeOnEscape) event.preventDefault()
		},
		[closeOnEscape],
	)

	React.useEffect(() => {
		const el = ref.current
		if (!el || !closeOnBackdropClick || !isModal) return

		const handleClick = (event: MouseEvent) => {
			// A backdrop click targets the dialog itself but lands outside its box.
			if (event.target !== el) return
			const rect = el.getBoundingClientRect()
			const inside =
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom
			if (inside) return
			onOpenChangeRef.current?.(false)
		}

		el.addEventListener("click", handleClick)
		return () => el.removeEventListener("click", handleClick)
	}, [closeOnBackdropClick, isModal])

	// show() does not generate the modal dialog's native cancel event. Listen after
	// React's delegated handlers so an inner picker can consume Escape first.
	React.useEffect(() => {
		const el = ref.current
		if (!el || isModal || !open || !closeOnEscape) return
		const dismiss = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return
			if (!(event.target instanceof Node) || !el.contains(event.target)) return
			event.preventDefault()
			onOpenChangeRef.current?.(false)
		}
		document.addEventListener("keydown", dismiss)
		return () => document.removeEventListener("keydown", dismiss)
	}, [isModal, open, closeOnEscape])

	// `'trap-focus'`: the UA gives a non-modal dialog no trap, so Tab wraps at the edges.
	React.useEffect(() => {
		const el = ref.current
		if (!el || isModal || !trapsFocus || !open) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Tab") return
			const focusable = el.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
			)
			const first = focusable[0]
			const last = focusable[focusable.length - 1]
			if (!first || !last) return

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		}

		el.addEventListener("keydown", handleKeyDown)
		return () => el.removeEventListener("keydown", handleKeyDown)
	}, [isModal, trapsFocus, open])

	// Re-assert initial focus a frame later: a dialog that just closed restores focus
	// asynchronously and can land after `reconcile`'s. A no-op if focus held.
	React.useEffect(() => {
		if (!open || !initialFocusRef) return
		const frame = requestAnimationFrame(() => {
			const el = ref.current
			const target = initialFocusRef.current
			if (!el || !target) return
			if (!el.contains(document.activeElement)) target.focus()
		})
		return () => cancelAnimationFrame(frame)
	}, [open, initialFocusRef])

	React.useEffect(() => {
		if (!open || !isModal) return
		return acquireScrollLock()
	}, [open, isModal])

	return { ref, onClose: handleClose, onCancel: handleCancel, reconcile }
}
