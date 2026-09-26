import type { ToastPosition } from "./toast-store"

declare module "@/lib/ui-provider" {
	interface ComponentDefaults {
		toast: {
			position: ToastPosition
			/** Default lifetime in ms. */
			duration: number
			visibleToasts: number
			closeButton: boolean
		}
	}
}
