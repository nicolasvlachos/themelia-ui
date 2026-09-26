/**
 * Observers that degrade to "never fires" where the API is missing (jsdom lacks
 * `ResizeObserver`, `IntersectionObserver` and `matchMedia`), so components do not throw
 * on mount in consumers' unit tests. Each returns a disposer either way.
 */

const noop = () => {}

/** Observes size changes, or does nothing where `ResizeObserver` does not exist. */
export function observeResize(
	targets: Element | Element[] | null | undefined,
	onResize: ResizeObserverCallback,
): () => void {
	if (typeof ResizeObserver === "undefined" || !targets) return noop
	const observer = new ResizeObserver(onResize)
	for (const target of Array.isArray(targets) ? targets : [targets]) observer.observe(target)
	return () => observer.disconnect()
}

/** Observes intersection, or does nothing where `IntersectionObserver` does not exist. */
export function observeIntersection(
	targets: Element[] | null | undefined,
	onIntersect: IntersectionObserverCallback,
	options?: IntersectionObserverInit,
): () => void {
	if (typeof IntersectionObserver === "undefined" || !targets?.length) return noop
	const observer = new IntersectionObserver(onIntersect, options)
	for (const target of targets) observer.observe(target)
	return () => observer.disconnect()
}

/** Subscribes to a media query, or does nothing where `matchMedia` does not exist. */
export function observeMediaQuery(query: string, onChange: () => void): () => void {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return noop
	const media = window.matchMedia(query)
	media.addEventListener("change", onChange)
	return () => media.removeEventListener("change", onChange)
}

/** Whether a media query matches now. `false` where `matchMedia` does not exist. */
export function mediaQueryMatches(query: string): boolean {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
	return window.matchMedia(query).matches
}
