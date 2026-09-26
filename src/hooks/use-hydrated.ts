import { useSyncExternalStore } from "react"

const neverChanges = () => () => {}

/**
 * Whether this render is on the client, for a portal or measurement that cannot exist on
 * the server. False on the server and during hydration, true after.
 */
export function useHydrated(): boolean {
	return useSyncExternalStore(
		neverChanges,
		() => true,
		() => false,
	)
}
