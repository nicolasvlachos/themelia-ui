import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const serverSnapshot = () => false
const clientSnapshot = () => typeof navigator !== "undefined" && /iPhone/i.test(navigator.userAgent)

/** True when `enabled` and the device is an iPhone; false on the server and during hydration. */
export function useIPhoneInputZoom(enabled?: boolean) {
	const isIPhone = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
	return enabled === true && isIPhone
}
