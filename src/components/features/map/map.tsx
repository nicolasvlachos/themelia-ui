/**
 * Map: a Leaflet surface in the kit's vocabulary.
 *
 * `MapTileLayer` and `MapLayerGroup` register with `MapLayers` on mount, so adding a layer
 * is adding a component; no parallel `layers` array to keep in step. Controls are ordinary
 * React children positioned over the map (not Leaflet controls) and borrow only Leaflet's
 * event suppression, so a click on a button is not also a click on the map.
 */
import {
	CircleIcon, LayersIcon, LoaderCircleIcon, MapPinIcon, MaximizeIcon, MinimizeIcon,
	MinusIcon, NavigationIcon, PenLineIcon, PentagonIcon, PlusIcon, SquareIcon,
	Trash2Icon, Undo2Icon, WaypointsIcon,
} from "lucide-react"
import {
	createContext, useCallback, useContext, useEffect, useRef, useState,
	type ComponentProps, type CSSProperties, type ReactNode, type Ref,
} from "react"
import { renderToString } from "react-dom/server"

import type {
	Circle, CircleMarker, DivIconOptions, Draw, DrawEvents, DrawMap, DrawOptions,
	EditToolbar, ErrorEvent, FeatureGroup, LatLngExpression, LayerGroup,
	Map as LeafletMapInstance, LocateOptions, LocationEvent, Marker, MarkerCluster,
	PointExpression, Polygon, Polyline, Popup, Rectangle, TileLayer, Tooltip,
} from "leaflet"
import type {
	CircleMarkerProps, CircleProps, LayerGroupProps, MapContainerProps, MarkerProps,
	PolygonProps, PolylineProps, PopupProps, RectangleProps, TileLayerProps, TooltipProps,
} from "react-leaflet"
import type { MarkerClusterGroupProps } from "react-leaflet-markercluster"

import { Button, ButtonGroup } from "@/components/base/buttons"
import {
	DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
	DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
	DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import { cx } from "@/lib/cx"
import { useUIConfig } from "@/lib/ui-provider"

import { applyDrawGlobals, type LeafletDrawGlobals } from "./map-draw-globals"
import { defaultTileLayerIsUnknown, resolveTileLayer } from "./resolve-tile-layer"
import { defaultMapStrings, type MapStrings } from "./map.strings"
import {
	LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup,
	LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon,
	LeafletPolyline, LeafletPopup, LeafletRectangle, LeafletTileLayer, LeafletTooltip,
	ReactLeafletHooksProvider, assignRef, useDelayedLoadingState, useLeaflet, useLeafletMap,
	useLeafletMapEvents, type LeafletModule,
} from "./map-runtime"
import { PlaceAutocomplete, type PlaceAutocompleteProps } from "./place-autocomplete"
import styles from "./map.module.css"

/* Strings travel through context so nested controls need no prop threading. */
const MapStringsContext = createContext<MapStrings>(defaultMapStrings)

function useMapStrings() {
	return useContext(MapStringsContext)
}

/** Corner the control anchors to. */
export type MapControlPosition =
	| "top-left" | "top-right" | "bottom-left" | "bottom-right"

const POSITION_CLASS = {
	"top-left": styles.topLeft,
	"top-right": styles.topRight,
	"bottom-left": styles.bottomLeft,
	"bottom-right": styles.bottomRight,
} satisfies Record<MapControlPosition, string>

/**
 * Whether the map sits in dark, read from its own container's computed `color-scheme`. Every
 * theme boundary sets that property, so this follows `.dark`, `[data-theme]`, a UIScope
 * island and the OS preference alike. Resolved on the first render, so dark never paints
 * light tiles first.
 */
function useIsDark(map: LeafletMapInstance) {
	const { colorScheme } = useUIConfig()
	const read = useCallback(() => getComputedStyle(map.getContainer()).colorScheme === "dark", [map])
	const [isDark, setIsDark] = useState(read)

	useEffect(() => {
		const update = () => setIsDark(read())

		update()
		// The provider's scheme is a dependency; these catch the rest: a class or attribute a
		// toggle sets without the provider, and the OS preference "system" follows.
		const observer = new MutationObserver(update)
		for (const target of [document.documentElement, document.body]) {
			observer.observe(target, { attributes: true, attributeFilter: ["class", "data-theme"] })
		}
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		media.addEventListener("change", update)

		return () => {
			observer.disconnect()
			media.removeEventListener("change", update)
		}
	}, [colorScheme, read])

	return isDark
}

export type MapProps = Omit<MapContainerProps, "zoomControl"> & {
	center: LatLngExpression
	/**
	 * Minimum height: a named step or any CSS length. The map still grows to fill a flex
	 * parent that gives it room.
	 */
	height?: "sm" | "md" | "lg" | (string & {})
	/**
	 * `framed` draws a border and radius; `flush` removes both, for a map that is the panel
	 * itself (a sheet body, a full-bleed hero).
	 */
	surface?: "framed" | "flush"
	ref?: Ref<LeafletMapInstance>
	strings?: Partial<MapStrings>
}

const MAP_HEIGHT = { sm: styles.heightSm, md: styles.heightMd, lg: styles.heightLg }

export function Map({
	zoom = 15,
	maxZoom = 18,
	height = "md",
	surface = "framed",
	className,
	children,
	strings,
	style,
	...props
}: MapProps) {
	const copy = { ...defaultMapStrings, ...strings }
	const named = MAP_HEIGHT[height as keyof typeof MAP_HEIGHT]

	return (
		<LeafletMapContainer
			zoom={zoom}
			maxZoom={maxZoom}
			/* Keep Leaflet's attribution surface by default; only zoom is replaced. */
			attributionControl={true}
			zoomControl={false}
			className={cx(
				"map--component",
				styles.map,
				named,
				surface === "flush" ? styles.surfaceFlush : styles.surfaceFramed,
				className,
			)}
			/* A length feeds the same `--map-h` property the named steps set. */
			style={named ? style : ({ ...style, "--map-h": height } as CSSProperties)}
			{...props}
		>
			<MapStringsContext.Provider value={copy}>
				<ReactLeafletHooksProvider>{children}</ReactLeafletHooksProvider>
			</MapStringsContext.Provider>
		</LeafletMapContainer>
	)
}

/* ── Layers ───────────────────────────────────────────────────────────────────────── */

interface MapTileLayerOption {
	name: string
	url: string
	attribution?: string
}

interface MapLayerGroupOption {
	name: string
	disabled?: boolean
}

interface MapLayersContextType {
	registerTileLayer: (layer: MapTileLayerOption) => void
	tileLayers: MapTileLayerOption[]
	selectedTileLayer: string
	setSelectedTileLayer: (name: string) => void
	registerLayerGroup: (layer: MapLayerGroupOption) => void
	layerGroups: MapLayerGroupOption[]
	activeLayerGroups: string[]
	setActiveLayerGroups: (names: string[]) => void
}

const MapLayersContext = createContext<MapLayersContextType | null>(null)

function useMapLayersContext() {
	return useContext(MapLayersContext)
}

/*
 * OpenStreetMap: the only basemap that renders with no key or account. There is no
 * key-less dark basemap, so dark mode inverts it (`data-tile-filter`) unless a `darkUrl`
 * is supplied.
 */
const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
const DEFAULT_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export type MapTileLayerProps = Partial<TileLayerProps> & {
	/** Names the layer in the layer control. */
	name?: string
	/** Swapped in when the dark theme is active. */
	darkUrl?: string
	darkAttribution?: string
	ref?: Ref<TileLayer>
}

export function MapTileLayer({
	name: nameProp,
	url,
	attribution,
	darkUrl,
	darkAttribution,
	...props
}: MapTileLayerProps) {
	const strings = useMapStrings()
	const name = nameProp ?? strings.defaultTileLayer
	const map = useLeafletMap()
	const context = useContext(MapLayersContext)
	const isDark = useIsDark(map)

	/* Keep the provider attribution; drop Leaflet's own prefix. */
	useEffect(() => {
		map.attributionControl?.setPrefix("")
	}, [map])

	const resolvedUrl = isDark ? (darkUrl ?? url ?? DEFAULT_TILE_URL) : (url ?? DEFAULT_TILE_URL)
	const resolvedAttribution =
		isDark && darkAttribution ? darkAttribution : (attribution ?? DEFAULT_ATTRIBUTION)

	/* Invert only when dark and no dark basemap was supplied. */
	const filterTiles = isDark && !darkUrl

	useEffect(() => {
		const container = map.getContainer()
		if (filterTiles) container.dataset.tileFilter = "invert"
		else delete container.dataset.tileFilter
	}, [filterTiles, map])

	useEffect(() => {
		context?.registerTileLayer({ name, url: resolvedUrl, attribution: resolvedAttribution })
	}, [context, name, resolvedAttribution, resolvedUrl])

	// Inside a MapLayers, only the chosen one draws; outside one, every layer does.
	if (context && context.selectedTileLayer !== name) return null

	return <LeafletTileLayer url={resolvedUrl} attribution={resolvedAttribution} {...props} />
}

export type MapLayerGroupProps = LayerGroupProps &
	MapLayerGroupOption & { ref?: Ref<LayerGroup> }

export function MapLayerGroup({ name, disabled, ...props }: MapLayerGroupProps) {
	const context = useMapLayersContext()

	useEffect(() => {
		context?.registerLayerGroup({ name, disabled })
	}, [context, disabled, name])

	if (context && !context.activeLayerGroups.includes(name)) return null
	return <LeafletLayerGroup {...props} />
}

export type MapFeatureGroupProps = LayerGroupProps &
	MapLayerGroupOption & { ref?: Ref<FeatureGroup> }

export function MapFeatureGroup({ name, disabled, ...props }: MapFeatureGroupProps) {
	const context = useMapLayersContext()

	useEffect(() => {
		context?.registerLayerGroup({ name, disabled })
	}, [context, disabled, name])

	if (context && !context.activeLayerGroups.includes(name)) return null
	return <LeafletFeatureGroup {...props} />
}

export interface MapLayersProps {
	children?: ReactNode
	/** Must name a MapTileLayer. The first registered one wins when it does not. */
	defaultTileLayer?: string
	defaultLayerGroups?: string[]
	/** Hears about a `defaultTileLayer` or `defaultLayerGroups` naming nothing. */
	onError?: (error: Error) => void
}

export function MapLayers({
	defaultTileLayer,
	defaultLayerGroups,
	onError,
	children,
}: MapLayersProps) {
	const [tileLayers, setTileLayers] = useState<MapTileLayerOption[]>([])
	const [selectedTileLayer, setSelectedTileLayer] = useState(defaultTileLayer ?? "")
	const [layerGroups, setLayerGroups] = useState<MapLayerGroupOption[]>([])
	const [activeLayerGroups, setActiveLayerGroups] = useState<string[]>(
		() => defaultLayerGroups ?? [],
	)

	const registerTileLayer = useCallback((layer: MapTileLayerOption) => {
		setTileLayers((current) =>
			current.some((one) => one.name === layer.name) ? current : [...current, layer],
		)
	}, [])

	const registerLayerGroup = useCallback((layer: MapLayerGroupOption) => {
		setLayerGroups((current) =>
			current.some((one) => one.name === layer.name) ? current : [...current, layer],
		)
	}, [])

	/*
	 * Derived, so a selection naming no registered layer falls back to the first one
	 * (`MapTileLayer` draws only when its name equals the selection).
	 */
	const resolvedTileLayer = resolveTileLayer({
		selected: selectedTileLayer,
		defaultTileLayer,
		available: tileLayers,
	})

	/* Reported through `onError`, not thrown: the map still works on its first layer. */
	const unknownDefault = defaultTileLayerIsUnknown({
		selected: selectedTileLayer,
		defaultTileLayer,
		available: tileLayers,
	})
	useEffect(() => {
		if (!unknownDefault) return
		onError?.(
			new Error(
				`MapLayers: defaultTileLayer "${defaultTileLayer}" matches no MapTileLayer name. Showing the first layer instead.`,
			),
		)
	}, [defaultTileLayer, onError, unknownDefault])

	useEffect(() => {
		if (!defaultLayerGroups?.length || layerGroups.length === 0) return
		const missing = defaultLayerGroups.filter(
			(name) => !layerGroups.some((group) => group.name === name),
		)
		if (missing.length > 0) {
			onError?.(
				new Error(
					`MapLayers: defaultLayerGroups names no MapLayerGroup — ${missing.join(", ")}.`,
				),
			)
		}
	}, [defaultLayerGroups, layerGroups, onError])

	return (
		<MapLayersContext.Provider
			value={{
				registerTileLayer, tileLayers, selectedTileLayer: resolvedTileLayer, setSelectedTileLayer,
				registerLayerGroup, layerGroups, activeLayerGroups, setActiveLayerGroups,
			}}
		>
			{children}
		</MapLayersContext.Provider>
	)
}

export interface MapLayersControlProps extends ComponentProps<"button"> {
	tileLayersLabel?: string
	layerGroupsLabel?: string
	position?: MapControlPosition
}

export function MapLayersControl({
	tileLayersLabel,
	layerGroupsLabel,
	position = "top-right",
	className,
	...props
}: MapLayersControlProps) {
	const strings = useMapStrings()
	const context = useMapLayersContext()
	if (!context) throw new Error("MapLayersControl must be used inside <MapLayers>.")

	const {
		tileLayers, selectedTileLayer, setSelectedTileLayer,
		layerGroups, activeLayerGroups, setActiveLayerGroups,
	} = context

	// One tile layer is not a choice; no overlays means nothing to toggle.
	const showTileLayers = tileLayers.length > 1
	const showLayerGroups = layerGroups.length > 0
	if (!showTileLayers && !showLayerGroups) return null

	return (
		<MapControlContainer position={position} className="map-layers-control--component">
			<DropdownMenu>
				<DropdownMenuTrigger
					render={(triggerProps) => (
						<Button
							{...triggerProps}
							type="button"
							tone="neutral"
							buttonStyle="outline"
							iconOnly
							aria-label={strings.selectLayers}
							title={strings.selectLayers}
							className={cx(styles.controlButton, className, triggerProps.className)}
							{...props}
						>
							<LayersIcon />
						</Button>
					)}
				/>
				<DropdownMenuContent align="end" className={styles.controlMenu}>
					{showTileLayers && (
						<DropdownMenuRadioGroup
							value={selectedTileLayer}
							onValueChange={setSelectedTileLayer}
						>
							<DropdownMenuLabel>{tileLayersLabel ?? strings.mapType}</DropdownMenuLabel>
							{tileLayers.map((layer) => (
								<DropdownMenuRadioItem key={layer.name} value={layer.name}>
									{layer.name}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					)}

					{showTileLayers && showLayerGroups && <DropdownMenuSeparator />}

					{showLayerGroups && (
						<DropdownMenuGroup>
							<DropdownMenuLabel>{layerGroupsLabel ?? strings.layers}</DropdownMenuLabel>
							{layerGroups.map((group) => (
								<DropdownMenuCheckboxItem
									key={group.name}
									checked={activeLayerGroups.includes(group.name)}
									disabled={group.disabled}
									onCheckedChange={(checked) =>
										setActiveLayerGroups(
											checked
												? [...activeLayerGroups, group.name]
												: activeLayerGroups.filter((name) => name !== group.name),
										)
									}
								>
									{group.name}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuGroup>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</MapControlContainer>
	)
}

/* ── Overlays ─────────────────────────────────────────────────────────────────────── */

export type MapMarkerProps = Omit<MarkerProps, "icon"> &
	Pick<DivIconOptions, "iconAnchor" | "bgPos" | "popupAnchor" | "tooltipAnchor"> & {
		/** Rendered to a string and handed to Leaflet as a div icon. */
		icon?: ReactNode
		ariaLabel?: string
		ref?: Ref<Marker>
	}

export function MapMarker({
	icon = <MapPinIcon />,
	iconAnchor = [12, 12],
	bgPos,
	popupAnchor,
	tooltipAnchor,
	ariaLabel,
	ref,
	...props
}: MapMarkerProps) {
	const { L } = useLeaflet()
	const strings = useMapStrings()
	const markerRef = useRef<Marker | null>(null)

	const label =
		ariaLabel ??
		(typeof props.title === "string" && props.title.trim() ? props.title : undefined) ??
		strings.marker

	/*
	 * Leaflet builds the marker element outside React, so the accessible name is written
	 * onto it directly, again whenever the label changes.
	 */
	const syncElement = useCallback(
		(marker: Marker | null) => {
			const element = marker?.getElement()
			if (!element) return
			element.setAttribute("aria-label", label)
			if (!element.getAttribute("title")) element.setAttribute("title", label)
		},
		[label],
	)

	const handleRef = useCallback(
		(marker: Marker | null) => {
			markerRef.current = marker
			assignRef(ref, marker)
			syncElement(marker)
		},
		[ref, syncElement],
	)

	useEffect(() => syncElement(markerRef.current), [syncElement])

	if (!L) return null

	return (
		<LeafletMarker
			ref={handleRef}
			icon={L.divIcon({
				// An empty className suppresses `.leaflet-div-icon`'s white box around the glyph.
				className: "",
				html: renderToString(<span className={cx("map-marker--component", styles.markerIcon)}>{icon}</span>),
				iconAnchor,
				...(bgPos ? { bgPos } : {}),
				...(popupAnchor ? { popupAnchor } : {}),
				...(tooltipAnchor ? { tooltipAnchor } : {}),
			})}
			riseOnHover
			{...props}
			title={typeof props.title === "string" && props.title.trim() ? props.title : label}
		/>
	)
}

export type MapMarkerClusterGroupProps = Omit<
	MarkerClusterGroupProps,
	"iconCreateFunction"
> & {
	children: ReactNode
	/** Receives how many markers the cluster holds. */
	icon?: (markerCount: number) => ReactNode
}

export function MapMarkerClusterGroup({
	polygonOptions = { className: styles.shape },
	spiderLegPolylineOptions = { className: styles.shape },
	icon,
	...props
}: MapMarkerClusterGroupProps) {
	const { L } = useLeaflet()
	if (!L) return null

	return (
		<LeafletMarkerClusterGroup
			polygonOptions={polygonOptions}
			spiderLegPolylineOptions={spiderLegPolylineOptions}
			iconCreateFunction={
				icon
					? (cluster: MarkerCluster) =>
							L.divIcon({ html: renderToString(icon(cluster.getChildCount())) })
					: undefined
			}
			{...props}
		/>
	)
}

export function MapCircle({ className, ...props }: CircleProps & { ref?: Ref<Circle> }) {
	return <LeafletCircle className={cx("map-circle--component", styles.shape, className)} {...props} />
}

export function MapCircleMarker({
	className,
	...props
}: CircleMarkerProps & { ref?: Ref<CircleMarker> }) {
	return <LeafletCircleMarker className={cx("map-circle-marker--component", styles.shape, className)} {...props} />
}

export function MapPolyline({ className, ...props }: PolylineProps & { ref?: Ref<Polyline> }) {
	return <LeafletPolyline className={cx("map-polyline--component", styles.shape, className)} {...props} />
}

export function MapPolygon({ className, ...props }: PolygonProps & { ref?: Ref<Polygon> }) {
	return <LeafletPolygon className={cx("map-polygon--component", styles.shape, className)} {...props} />
}

export function MapRectangle({ className, ...props }: RectangleProps & { ref?: Ref<Rectangle> }) {
	return <LeafletRectangle className={cx("map-rectangle--component", styles.shape, className)} {...props} />
}

export function MapPopup({
	className,
	...props
}: Omit<PopupProps, "content"> & { ref?: Ref<Popup> }) {
	return <LeafletPopup className={cx("map-popup--component", styles.popup, className)} {...props} />
}

export type MapTooltipProps = Omit<TooltipProps, "offset"> & {
	side?: "top" | "right" | "bottom" | "left"
	/** Distance from the anchor, in pixels. */
	sideOffset?: number
	ref?: Ref<Tooltip>
}

export function MapTooltip({
	className,
	children,
	side = "top",
	sideOffset = 15,
	...props
}: MapTooltipProps) {
	/* Leaflet's offset is a vector, so each side spends it on its own axis and direction. */
	const offset: PointExpression = {
		top: [0, -sideOffset],
		bottom: [0, sideOffset],
		left: [-sideOffset, 0],
		right: [sideOffset, 0],
	}[side] as PointExpression

	return (
		<LeafletTooltip
			className={cx("map-tooltip--component", styles.tooltip, className)}
			data-side={side}
			direction={side}
			offset={offset}
			opacity={1}
			{...props}
		>
			{children}
			<span aria-hidden className={styles.tooltipArrow} />
		</LeafletTooltip>
	)
}

/* ── Controls ─────────────────────────────────────────────────────────────────────── */

export interface MapControlContainerProps extends ComponentProps<"div"> {
	position?: MapControlPosition
}

/**
 * The frame every control sits in. Beyond placement it suppresses Leaflet's handlers, so
 * a click on a button does not pan the map and a scroll over a menu does not zoom it.
 */
export function MapControlContainer({
	position,
	className,
	...props
}: MapControlContainerProps) {
	const { L } = useLeaflet()
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = ref.current
		if (!L || !element) return
		L.DomEvent.disableClickPropagation(element)
		L.DomEvent.disableScrollPropagation(element)
	}, [L])

	return (
		<div
			ref={ref}
			className={cx("map-control-container--component", styles.control, position && POSITION_CLASS[position], className)}
			{...props}
		/>
	)
}

export interface MapZoomControlProps extends ComponentProps<"div"> {
	position?: MapControlPosition
}

export function MapZoomControl({
	position = "top-left",
	className,
	...props
}: MapZoomControlProps) {
	const map = useLeafletMap()
	const strings = useMapStrings()
	const [zoom, setZoom] = useState(map.getZoom())

	useLeafletMapEvents({ zoomend: () => setZoom(map.getZoom()) })

	return (
		<MapControlContainer position={position} className={cx("map-zoom-control--component", className)}>
			<ButtonGroup orientation="vertical" aria-label={strings.zoomControls} {...props}>
				<Button
					type="button"
					tone="neutral"
					buttonStyle="outline"
					iconOnly
					aria-label={strings.zoomIn}
					title={strings.zoomIn}
					className={styles.controlButton}
					disabled={zoom >= map.getMaxZoom()}
					onClick={() => map.zoomIn()}
				>
					<PlusIcon />
				</Button>
				<Button
					type="button"
					tone="neutral"
					buttonStyle="outline"
					iconOnly
					aria-label={strings.zoomOut}
					title={strings.zoomOut}
					className={styles.controlButton}
					disabled={zoom <= map.getMinZoom()}
					onClick={() => map.zoomOut()}
				>
					<MinusIcon />
				</Button>
			</ButtonGroup>
		</MapControlContainer>
	)
}

export interface MapFullscreenControlProps extends ComponentProps<"button"> {
	position?: MapControlPosition
}

export function MapFullscreenControl({
	position = "top-right",
	className,
	...props
}: MapFullscreenControlProps) {
	const map = useLeafletMap()
	const strings = useMapStrings()
	const { L } = useLeaflet()
	const [isFullscreen, setIsFullscreen] = useState(false)

	useEffect(() => {
		if (!L) return

		/* The plugin's control is added and hidden: its behaviour is used, its button replaced by a kit Button. */
		const control = new L.Control.FullScreen()
		control.addTo(map)
		const container = control.getContainer()
		if (container) container.style.display = "none"

		const enter = () => setIsFullscreen(true)
		const exit = () => setIsFullscreen(false)
		map.on("enterFullscreen", enter)
		map.on("exitFullscreen", exit)

		return () => {
			control.remove()
			map.off("enterFullscreen", enter)
			map.off("exitFullscreen", exit)
		}
	}, [L, map])

	const label = isFullscreen ? strings.exitFullscreen : strings.enterFullscreen

	return (
		<MapControlContainer position={position} className="map-fullscreen-control--component">
			<Button
				type="button"
				tone="neutral"
				buttonStyle="outline"
				iconOnly
				onClick={() => map.toggleFullscreen()}
				aria-label={label}
				title={label}
				className={cx(styles.controlButton, className)}
				{...props}
			>
				{isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
			</Button>
		</MapControlContainer>
	)
}

/** The pulse that marks where the reader is. */
function MapLocatePulse() {
	return (
		<span className={styles.pulse}>
			<span className={styles.pulseRing} />
			<span className={styles.pulseDot} />
		</span>
	)
}

export interface MapLocateControlProps
	extends ComponentProps<"button">,
		Pick<LocateOptions, "watch"> {
	onLocationFound?: (location: LocationEvent) => void
	onLocationError?: (error: ErrorEvent) => void
	position?: MapControlPosition
}

export function MapLocateControl({
	watch = false,
	onLocationFound,
	onLocationError,
	position = "bottom-right",
	className,
	...props
}: MapLocateControlProps) {
	const map = useLeafletMap()
	const strings = useMapStrings()
	const [isLocating, setIsLocating] = useDelayedLoadingState(200)
	const [location, setLocation] = useState<LatLngExpression | null>(null)
	const hasLocation = location !== null

	const stop = useCallback(() => {
		map.stopLocate()
		map.off("locationfound")
		map.off("locationerror")
		setLocation(null)
		setIsLocating(false)
	}, [map, setIsLocating])

	const start = useCallback(() => {
		setIsLocating(true)
		map.locate({ setView: true, maxZoom: map.getMaxZoom(), watch })
		map.on("locationfound", (event: LocationEvent) => {
			setLocation(event.latlng)
			setIsLocating(false)
			onLocationFound?.(event)
		})
		map.on("locationerror", (event: ErrorEvent) => {
			setLocation(null)
			setIsLocating(false)
			onLocationError?.(event)
		})
	}, [map, onLocationError, onLocationFound, setIsLocating, watch])

	// Stop the watch on unmount; a running watch keeps the device's radio awake.
	useEffect(() => () => stop(), [stop])

	const title = isLocating
		? strings.locating
		: hasLocation
			? strings.stopTracking
			: strings.trackLocation
	const label = isLocating
		? strings.locating
		: hasLocation
			? strings.stopLocationTracking
			: strings.startLocationTracking

	return (
		<MapControlContainer position={position} className="map-locate-control--component">
			<Button
				type="button"
				tone={hasLocation ? "primary" : "neutral"}
				buttonStyle={hasLocation ? "solid" : "outline"}
				iconOnly
				onClick={hasLocation ? stop : start}
				disabled={isLocating}
				title={title}
				aria-label={label}
				className={cx(styles.controlButton, className)}
				{...props}
			>
				{isLocating ? <LoaderCircleIcon className={styles.spin} /> : <NavigationIcon />}
			</Button>
			{hasLocation && location && (
				<MapMarker
					position={location}
					icon={<MapLocatePulse />}
					ariaLabel={strings.currentLocation}
				/>
			)}
		</MapControlContainer>
	)
}

export interface MapSearchControlProps extends PlaceAutocompleteProps {
	position?: MapControlPosition
}

export function MapSearchControl({
	position = "top-left",
	className,
	...props
}: MapSearchControlProps) {
	return (
		<MapControlContainer position={position} className={cx("map-search-control--component", styles.searchControl)}>
			<PlaceAutocomplete className={className} {...props} />
		</MapControlContainer>
	)
}

/* ── Drawing ──────────────────────────────────────────────────────────────────────── */

type MapDrawShape = "marker" | "polyline" | "circle" | "rectangle" | "polygon"
type MapDrawAction = "edit" | "delete"
type MapDrawMode = MapDrawShape | MapDrawAction | null

interface MapDrawContextType {
	featureGroup: FeatureGroup | null
	activeMode: MapDrawMode
	setActiveMode: (mode: MapDrawMode) => void
	editControlRef: React.RefObject<EditToolbar.Edit | null>
	deleteControlRef: React.RefObject<EditToolbar.Delete | null>
	layersCount: number
}

const MapDrawContext = createContext<MapDrawContextType | null>(null)

function useMapDrawContext() {
	return useContext(MapDrawContext)
}

export interface MapDrawControlProps extends ComponentProps<"div"> {
	onLayersChange?: (layers: FeatureGroup) => void
	position?: MapControlPosition
}

export function MapDrawControl({
	onLayersChange,
	position = "bottom-left",
	className,
	children,
	...props
}: MapDrawControlProps) {
	const { L, LeafletDraw } = useLeaflet()
	const map = useLeafletMap()
	const [featureGroup, setFeatureGroup] = useState<FeatureGroup | null>(null)
	const editControlRef = useRef<EditToolbar.Edit | null>(null)
	const deleteControlRef = useRef<EditToolbar.Delete | null>(null)
	const [activeMode, setActiveMode] = useState<MapDrawMode>(null)
	const [layersCount, setLayersCount] = useState(0)

	const syncCount = useCallback(() => {
		// oxlint-disable-next-line react/set-state-in-effect -- reads Leaflet's own layer count; Leaflet owns that state and does not tell React when it changes
		if (featureGroup) setLayersCount(featureGroup.getLayers().length)
	}, [featureGroup])

	const handleCreated = useCallback(
		(event: DrawEvents.Created) => {
			if (!featureGroup) return
			featureGroup.addLayer(event.layer)
			onLayersChange?.(featureGroup)
			setLayersCount(featureGroup.getLayers().length)
			// One shape per press: staying armed would draw another on the next map click.
			setActiveMode(null)
		},
		[featureGroup, onLayersChange],
	)

	const handleEditedOrDeleted = useCallback(() => {
		if (!featureGroup) return
		onLayersChange?.(featureGroup)
		setLayersCount(featureGroup.getLayers().length)
		setActiveMode(null)
	}, [featureGroup, onLayersChange])

	useEffect(() => {
		if (!L || !LeafletDraw || !map) return

		map.on(L.Draw.Event.CREATED, handleCreated as L.LeafletEventHandlerFn)
		map.on(L.Draw.Event.EDITED, handleEditedOrDeleted)
		map.on(L.Draw.Event.DELETED, handleEditedOrDeleted)

		return () => {
			map.off(L.Draw.Event.CREATED, handleCreated as L.LeafletEventHandlerFn)
			map.off(L.Draw.Event.EDITED, handleEditedOrDeleted)
			map.off(L.Draw.Event.DELETED, handleEditedOrDeleted)
		}
	}, [L, LeafletDraw, handleCreated, handleEditedOrDeleted, map])

	useEffect(syncCount, [syncCount])

	return (
		<MapDrawContext.Provider
			value={{ featureGroup, activeMode, setActiveMode, editControlRef, deleteControlRef, layersCount }}
		>
			{/* The group is state, not a ref: every button below must re-render when it mounts. */}
			<LeafletFeatureGroup ref={setFeatureGroup} />
			<MapControlContainer position={position} className={className}>
				<ButtonGroup orientation="vertical" {...props}>
					{children}
				</ButtonGroup>
			</MapControlContainer>
		</MapDrawContext.Provider>
	)
}

function MapDrawShapeButton<T extends Draw.Feature>({
	drawMode,
	createDrawTool,
	className,
	children,
	...props
}: ComponentProps<"button"> & {
	drawMode: MapDrawShape
	createDrawTool: (L: LeafletModule, map: DrawMap) => T
}) {
	const context = useMapDrawContext()
	if (!context) throw new Error("Draw buttons must be used inside <MapDrawControl>.")

	const { L } = useLeaflet()
	const strings = useMapStrings()
	const map = useLeafletMap()
	const controlRef = useRef<T | null>(null)
	const { activeMode, setActiveMode } = context
	const isActive = activeMode === drawMode

	const label = {
		marker: strings.drawMarker,
		polyline: strings.drawPolyline,
		circle: strings.drawCircle,
		rectangle: strings.drawRectangle,
		polygon: strings.drawPolygon,
	}[drawMode]

	useEffect(() => {
		if (!L || !isActive) {
			controlRef.current?.disable()
			controlRef.current = null
			return
		}
		const control = createDrawTool(L, map as DrawMap)
		control.enable()
		controlRef.current = control
		return () => {
			control.disable()
			controlRef.current = null
		}
	}, [L, createDrawTool, isActive, map])

	return (
		<Button
			type="button"
			iconOnly
			aria-label={label}
			title={label}
			className={cx(styles.controlButton, className)}
			tone={isActive ? "primary" : "neutral"}
			buttonStyle={isActive ? "solid" : "outline"}
			// Disabled while editing or deleting: that handler owns the map's clicks.
			disabled={activeMode === "edit" || activeMode === "delete"}
			onClick={() => setActiveMode(isActive ? null : drawMode)}
			{...props}
		>
			{children}
		</Button>
	)
}

/* Leaflet applies these as inline SVG attributes, so they are custom properties resolved at use. */
const DRAW_SHAPE_OPTIONS = { color: "var(--primary)", opacity: 1, weight: 2 }
const DRAW_ERROR_OPTIONS = { color: "var(--destructive)" }

export function MapDrawMarker(props: DrawOptions.MarkerOptions) {
	return (
		<MapDrawShapeButton
			drawMode="marker"
			createDrawTool={(L, map) =>
				new L.Draw.Marker(map, {
					icon: L.divIcon({
						// Empty, as in MapMarker; it also keeps the glyph from shifting between modes.
						className: "",
						iconAnchor: [12, 12],
						html: renderToString(
							<span className={cx("map-draw-marker--component", styles.markerIcon)}>
								<MapPinIcon />
							</span>,
						),
					}),
					...props,
				})
			}
		>
			<MapPinIcon />
		</MapDrawShapeButton>
	)
}

export function MapDrawPolyline({
	showLength = false,
	drawError = DRAW_ERROR_OPTIONS,
	shapeOptions = DRAW_SHAPE_OPTIONS,
	...props
}: DrawOptions.PolylineOptions) {
	const handleIcon = useMapDrawHandleIcon()

	return (
		<MapDrawShapeButton
			drawMode="polyline"
			createDrawTool={(L, map) =>
				new L.Draw.Polyline(map, {
					...(handleIcon ? { icon: handleIcon, touchIcon: handleIcon } : {}),
					showLength,
					drawError,
					shapeOptions,
					...props,
				})
			}
		>
			<WaypointsIcon />
		</MapDrawShapeButton>
	)
}

export function MapDrawCircle({
	showRadius = false,
	shapeOptions = DRAW_SHAPE_OPTIONS,
	...props
}: DrawOptions.CircleOptions) {
	return (
		<MapDrawShapeButton
			drawMode="circle"
			createDrawTool={(L, map) => new L.Draw.Circle(map, { showRadius, shapeOptions, ...props })}
		>
			<CircleIcon />
		</MapDrawShapeButton>
	)
}

export function MapDrawRectangle({
	showArea = false,
	shapeOptions = DRAW_SHAPE_OPTIONS,
	...props
}: DrawOptions.RectangleOptions) {
	return (
		<MapDrawShapeButton
			drawMode="rectangle"
			createDrawTool={(L, map) => new L.Draw.Rectangle(map, { showArea, shapeOptions, ...props })}
		>
			<SquareIcon />
		</MapDrawShapeButton>
	)
}

export function MapDrawPolygon({
	drawError = DRAW_ERROR_OPTIONS,
	shapeOptions = DRAW_SHAPE_OPTIONS,
	...props
}: DrawOptions.PolygonOptions) {
	const handleIcon = useMapDrawHandleIcon()

	return (
		<MapDrawShapeButton
			drawMode="polygon"
			createDrawTool={(L, map) =>
				new L.Draw.Polygon(map, {
					...(handleIcon ? { icon: handleIcon, touchIcon: handleIcon } : {}),
					drawError,
					shapeOptions,
					...props,
				})
			}
		>
			<PentagonIcon />
		</MapDrawShapeButton>
	)
}

function MapDrawActionButton<T extends EditToolbar.Edit | EditToolbar.Delete>({
	drawAction,
	createDrawTool,
	controlRef,
	className,
	children,
	...props
}: ComponentProps<"button"> & {
	drawAction: MapDrawAction
	createDrawTool: (L: LeafletModule, map: DrawMap, featureGroup: FeatureGroup) => T
	controlRef: React.RefObject<T | null>
}) {
	const context = useMapDrawContext()
	if (!context) throw new Error("Draw buttons must be used inside <MapDrawControl>.")

	const { L } = useLeaflet()
	const strings = useMapStrings()
	const map = useLeafletMap()
	const { featureGroup, activeMode, setActiveMode, layersCount } = context
	const isActive = activeMode === drawAction

	useEffect(() => {
		if (!L || !featureGroup || !isActive) {
			controlRef.current?.disable?.()
			controlRef.current = null
			return
		}
		const control = createDrawTool(L, map as DrawMap, featureGroup)
		control.enable?.()
		controlRef.current = control
		return () => {
			control.disable?.()
			controlRef.current = null
		}
	}, [L, controlRef, createDrawTool, featureGroup, isActive, map])

	return (
		<Button
			type="button"
			iconOnly
			aria-label={drawAction === "edit" ? strings.editShapes : strings.removeShapes}
			title={drawAction === "edit" ? strings.editShapes : strings.removeShapes}
			tone={isActive ? "primary" : "neutral"}
			buttonStyle={isActive ? "solid" : "outline"}
			// Nothing drawn, nothing to edit or remove.
			disabled={layersCount === 0}
			onClick={() => {
				// Leaving the mode commits: leaflet-draw stages changes until save() runs.
				controlRef.current?.save()
				setActiveMode(isActive ? null : drawAction)
			}}
			className={cx(styles.controlButton, className)}
			{...props}
		>
			{children}
		</Button>
	)
}

export function MapDrawEdit({
	selectedPathOptions = {
		color: "var(--primary)",
		fillColor: "var(--primary)",
		weight: 2,
	},
	...props
}: Omit<EditToolbar.EditHandlerOptions, "featureGroup">) {
	const { L } = useLeaflet()
	const strings = useMapStrings()
	const handleIcon = useMapDrawHandleIcon()
	const context = useMapDrawContext()
	if (!context) throw new Error("MapDrawEdit must be used inside <MapDrawControl>.")

	useEffect(() => {
		if (!L || !handleIcon) return

		/*
		 * leaflet-draw reads these globals when a handler starts; `applyDrawGlobals` returns
		 * its own undo, so returning it is the cleanup (see map-draw-globals.ts).
		 */
		return applyDrawGlobals(L as unknown as LeafletDrawGlobals, {
			handleIcon,
			drawError: DRAW_ERROR_OPTIONS,
			editInstructions: strings.editInstructions,
			removeInstructions: strings.removeInstructions,
		})
	}, [L, handleIcon, strings.editInstructions, strings.removeInstructions])

	return (
		<MapDrawActionButton
			drawAction="edit"
			controlRef={context.editControlRef}
			createDrawTool={(L, map, featureGroup) =>
				new L.EditToolbar.Edit(map, { featureGroup, selectedPathOptions, ...props })
			}
		>
			<PenLineIcon />
		</MapDrawActionButton>
	)
}

export function MapDrawDelete() {
	const context = useMapDrawContext()
	if (!context) throw new Error("MapDrawDelete must be used inside <MapDrawControl>.")

	return (
		<MapDrawActionButton
			drawAction="delete"
			controlRef={context.deleteControlRef}
			createDrawTool={(L, map, featureGroup) => new L.EditToolbar.Delete(map, { featureGroup })}
		>
			<Trash2Icon />
		</MapDrawActionButton>
	)
}

export function MapDrawUndo({ className, ...props }: ComponentProps<"button">) {
	const context = useMapDrawContext()
	if (!context) throw new Error("MapDrawUndo must be used inside <MapDrawControl>.")
	const strings = useMapStrings()

	const { activeMode, setActiveMode, editControlRef, deleteControlRef, layersCount } = context
	const editing = activeMode === "edit"
	const deleting = activeMode === "delete"
	const label = deleting ? strings.undoRemove : strings.undoEdit

	return (
		<Button
			type="button"
			tone="neutral"
			buttonStyle="outline"
			iconOnly
			aria-label={label}
			title={label}
			// Only within a mode with staged changes; outside one leaflet-draw has already committed.
			disabled={!((editing || deleting) && layersCount > 0)}
			onClick={() => {
				if (editing) editControlRef.current?.revertLayers()
				else if (deleting) deleteControlRef.current?.revertLayers()
				setActiveMode(null)
			}}
			className={cx("map-draw-undo--component", styles.controlButton, className)}
			{...props}
		>
			<Undo2Icon />
		</Button>
	)
}

/** The grip on a vertex, drawn once and reused by every handler that has one. */
function useMapDrawHandleIcon() {
	const { L } = useLeaflet()
	if (!L) return null

	return L.divIcon({
		iconAnchor: [8, 8],
		html: renderToString(<span className={styles.drawHandle} />),
	})
}
