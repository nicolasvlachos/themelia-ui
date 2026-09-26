/* oxlint-disable react/only-export-components -- everything this file exports is a
   component; they are produced by `createLazyComponent`, and the rule cannot see a
   component through the call that makes it. */
/**
 * Leaflet interop: loading it and handing it to the components.
 *
 * Everything from react-leaflet is lazy: Leaflet is large, reads `window` at import, and
 * most pages never render a map; the wrapper also waits one effect so SSR never evaluates
 * it. `useMap`/`useMapEvents` travel through a context from a provider that has already
 * resolved the module, so controls call them normally.
 */
import {
	Suspense, createContext, lazy, useContext, useEffect, useState,
	type ComponentProps, type ComponentType, type ReactNode, type Ref,
} from "react"

import type * as LeafletNamespace from "leaflet"
import type * as LeafletDrawNamespace from "leaflet-draw"
import type {} from "leaflet.markercluster"
import { useHydrated } from "@/hooks/use-hydrated"

export type LeafletModule = typeof LeafletNamespace
export type LeafletDrawModule = typeof LeafletDrawNamespace
type ReactLeafletModule = typeof import("react-leaflet")
type ReactLeafletHooks = Pick<ReactLeafletModule, "useMap" | "useMapEvents">

const ReactLeafletHooksContext = createContext<ReactLeafletHooks | null>(null)

/*
 * React types `lazy` as `lazy<T extends ComponentType<any>>` and JSX needs
 * `JSXElementConstructor<any>`, so a generic wrapper inherits the `any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- forced by React's own lazy/JSX declarations; see above.
function createLazyComponent<T extends ComponentType<any>>(
	factory: () => Promise<{ default: T }>,
) {
	const Lazy = lazy(factory)

	return function LazyBoundary(props: ComponentProps<T>) {
		// Nothing on the first pass: Leaflet reads `window` while it evaluates.
		const hydrated = useHydrated()
		if (!hydrated) return null
		return (
			<Suspense>
				<Lazy {...props} />
			</Suspense>
		)
	}
}

export const LeafletMapContainer = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.MapContainer })),
)
export const LeafletTileLayer = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.TileLayer })),
)
export const LeafletMarker = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Marker })),
)
export const LeafletPopup = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Popup })),
)
export const LeafletTooltip = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Tooltip })),
)
export const LeafletCircle = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Circle })),
)
export const LeafletCircleMarker = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.CircleMarker })),
)
export const LeafletPolyline = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Polyline })),
)
export const LeafletPolygon = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Polygon })),
)
export const LeafletRectangle = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.Rectangle })),
)
export const LeafletLayerGroup = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.LayerGroup })),
)
export const LeafletFeatureGroup = createLazyComponent(() =>
	import("react-leaflet").then((mod) => ({ default: mod.FeatureGroup })),
)
export const LeafletMarkerClusterGroup = createLazyComponent(() =>
	import("react-leaflet-markercluster").then((mod) => ({ default: mod.default })),
)

export const ReactLeafletHooksProvider = createLazyComponent(async () => {
	const mod = await import("react-leaflet")

	function Provider({ children }: { children?: ReactNode }) {
		return (
			<ReactLeafletHooksContext.Provider
				value={{ useMap: mod.useMap, useMapEvents: mod.useMapEvents }}
			>
				{children}
			</ReactLeafletHooksContext.Provider>
		)
	}

	return { default: Provider }
})

export function useLeafletMap() {
	const hooks = useContext(ReactLeafletHooksContext)
	if (!hooks) throw new Error("Map controls must be rendered inside <Map>.")
	return hooks.useMap()
}

export function useLeafletMapEvents(
	handlers: Parameters<ReactLeafletModule["useMapEvents"]>[0],
) {
	const hooks = useContext(ReactLeafletHooksContext)
	if (!hooks) throw new Error("Map controls must be rendered inside <Map>.")
	return hooks.useMapEvents(handlers)
}

/** Leaflet plus draw and fullscreen once loaded; `null` until then, so callers must check. */
export function useLeaflet() {
	const [L, setL] = useState<LeafletModule | null>(null)
	const [LeafletDraw, setLeafletDraw] = useState<LeafletDrawModule | null>(null)

	useEffect(() => {
		if (L && LeafletDraw) return
		if (typeof window === "undefined") return

		async function load() {
			const leaflet = await import("leaflet")
			const fullscreen = await import("leaflet.fullscreen")
			const draw = await import("leaflet-draw")

			const instance = leaflet.default
			// leaflet.fullscreen self-registers only on a global L; attach it by hand for the module case.
			if (instance.Control && !instance.Control.FullScreen) {
				instance.Control.FullScreen = (fullscreen.default ??
					fullscreen) as typeof instance.Control.FullScreen
			}

			setLeafletDraw(draw)
			setL(instance)
		}

		void load()
	}, [L, LeafletDraw])

	return { L, LeafletDraw }
}

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
	if (!ref) return
	if (typeof ref === "function") {
		ref(value)
		return
	}
	;(ref as { current: T | null }).current = value
}

/**
 * Delays the appearance of a spinner so a fast lookup never flashes one. Not a debounce:
 * the work is neither collapsed nor deferred.
 */
export function useDelayedLoadingState(delay = 200) {
	const [isLoading, setIsLoading] = useState(false)
	const [showLoading, setShowLoading] = useState(false)

	useEffect(() => {
		if (!isLoading) {
			// oxlint-disable-next-line react/set-state-in-effect -- reports that a lazily-imported module has arrived — the thing being synchronised with is the import, which has no render-time representation
			setShowLoading(false)
			return
		}
		const timer = setTimeout(() => setShowLoading(true), delay)
		return () => clearTimeout(timer)
	}, [delay, isLoading])

	return [showLoading, setIsLoading] as const
}
