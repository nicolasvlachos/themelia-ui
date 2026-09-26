/**
 * The modal behaviour a full-screen table's appearance promises: Escape leaves, Tab cycles
 * inside, and focus returns to the opener. `aria-modal` on the region covers announcement.
 */
import { useEffect, type RefObject } from "react"
import { useLatest } from "@/hooks/use-latest"

const FOCUSABLE = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(",")

export function useFullscreenTableModality(
	active: boolean,
	regionRef: RefObject<HTMLElement | null>,
	onExit: () => void,
): void {
	// Through a ref, so an inline `onExit` does not rebuild the listener every render.
	const onExitRef = useLatest(onExit)

	useEffect(() => {
		if (!active || typeof document === "undefined") return

		const opener = document.activeElement as HTMLElement | null
		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = "hidden"

		const onKeyDown = (event: KeyboardEvent) => {
			const region = regionRef.current
			if (!region) return

			if (event.key === "Escape") {
				event.preventDefault()
				event.stopPropagation()
				onExitRef.current()
				return
			}

			if (event.key !== "Tab") return

			const focusables = Array.from(region.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
				// Hidden elements have a null `offsetParent`; the focused one stays in the cycle regardless.
				(node) => node.offsetParent !== null || node === document.activeElement,
			)
			if (focusables.length === 0) return

			const first = focusables[0]!
			const last = focusables[focusables.length - 1]!
			const current = document.activeElement
			const inside = current instanceof Node && region.contains(current)

			if (event.shiftKey && (!inside || current === first)) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && (!inside || current === last)) {
				event.preventDefault()
				first.focus()
			}
		}

		// Captured now: by cleanup the ref may point elsewhere.
		const guarded = regionRef.current

		document.addEventListener("keydown", onKeyDown, true)

		return () => {
			document.removeEventListener("keydown", onKeyDown, true)
			document.body.style.overflow = previousOverflow

			// Reclaim focus only if it is still inside the closing region.
			const current = document.activeElement
			const stillInside = guarded && current instanceof Node && guarded.contains(current)
			if ((stillInside || current === document.body) && opener?.isConnected) opener.focus()
		}
	}, [active, regionRef, onExitRef])
}
