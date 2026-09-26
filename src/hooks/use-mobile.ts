import { useSyncExternalStore } from "react"

import { observeMediaQuery } from "@/lib/observers"
import { BREAKPOINT_MIN_WIDTH } from "@/lib/responsive"

const MOBILE_BREAKPOINT = BREAKPOINT_MIN_WIDTH.md

const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/* A media query is an external store; reading it synchronously avoids a desktop-first frame. */
const subscribe = (onChange: () => void) => observeMediaQuery(QUERY, onChange)

/** Whether the viewport is below the `md` breakpoint. `false` on the server. */
export function useIsMobile(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => window.innerWidth < MOBILE_BREAKPOINT,
		() => false,
	)
}
