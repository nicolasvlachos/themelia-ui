import { useCallback } from "react"

import { isPathMatch, toPath } from "@/lib/navigation"

/** Returns a render-stable predicate: "is this href the current page?". */
export function useActivePath(currentUrl = "/") {
	return useCallback((href?: string) => !!href && isPathMatch(currentUrl, toPath(href)), [currentUrl])
}
