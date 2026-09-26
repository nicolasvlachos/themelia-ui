/*
 * Leaflet's stylesheets are the consumer's import, not the kit's. They are unlayered, so
 * features/map out-specifies a few rules (map.module.css).
 */
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.fullscreen/dist/Control.FullScreen.css"

import { useState } from "react"

import { Badge } from "@/components/base/badge"
import { Text } from "@/components/base/typography"
import {
	Map, MapDrawCircle, MapDrawControl, MapDrawDelete, MapDrawEdit, MapDrawMarker,
	MapDrawPolygon, MapDrawPolyline, MapDrawRectangle, MapDrawUndo, MapFullscreenControl,
	MapLayerGroup, MapLayers, MapLayersControl, MapLocateControl, MapMarker, MapPopup,
	MapSearchControl, MapTileLayer, MapTooltip, MapZoomControl,
	PlaceAutocomplete, type PlaceFeature,
} from "@/components/features"

import styles from "../preview.module.css"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const MARLOW: [number, number] = [51.5687, -0.7746]

const VENUES: { id: string; name: string; position: [number, number]; capacity: number }[] = [
	{ id: "v1", name: "Marlow Hall", position: [51.5687, -0.7746], capacity: 180 },
	{ id: "v2", name: "The Old Granary", position: [51.5731, -0.7692], capacity: 60 },
	{ id: "v3", name: "Riverside Rooms", position: [51.5642, -0.7801], capacity: 240 },
]

export function MapPage() {
	const [place, setPlace] = useState<PlaceFeature | null>(null)
	const [shapes, setShapes] = useState(0)

	return (
		<ComponentPage
			title="Map"
			summary="A Leaflet surface composed the way the rest of the kit is: layers, markers, and controls are components, and the ones that belong to a control register themselves with it. Leaflet and its plugins are optional peers, loaded only when a map actually mounts."
			importPath="@/components/features/map"
			exports={["Map", "MapMarker", "MapZoomControl", "PlaceAutocomplete",
				"MapTileLayer", "MapLayers", "MapLayerGroup", "MapFeatureGroup", "MapLayersControl", "MapMarkerClusterGroup", "MapCircle", "MapCircleMarker", "MapPolyline", "MapPolygon", "MapRectangle", "MapPopup", "MapTooltip", "MapControlContainer", "MapFullscreenControl", "MapLocateControl", "MapSearchControl", "MapDrawControl", "MapDrawMarker", "MapDrawPolyline", "MapDrawPolygon", "MapDrawRectangle", "MapDrawCircle", "MapDrawEdit", "MapDrawDelete", "MapDrawUndo", "useLeaflet", "usePlaceSearch",
			]}
		>
			<Example
				id="map"
				title="A map with controls"
				description="Zoom, layers, fullscreen, locate, and search — each an ordinary child positioned over the tiles, built from the kit's own Button and DropdownMenu rather than Leaflet's hand-built control DOM. The default basemap is OpenStreetMap's own, because it is the only one that renders with no key — and in dark mode it is inverted, since there is no key-less dark basemap to pair with it."
				stacked
				code={`<Map center={[51.5687, -0.7746]} zoom={13}>
  <MapLayers defaultTileLayer="Streets">
    <MapTileLayer name="Streets" />
    <MapTileLayer name="Terrain" url="https://tile.opentopomap.org/{z}/{x}/{y}.png" />
    <MapLayerGroup name="Venues">
      {venues.map((venue) => (
        <MapMarker key={venue.id} position={venue.position}>
          <MapPopup>{venue.name}</MapPopup>
        </MapMarker>
      ))}
    </MapLayerGroup>
    <MapLayersControl />
  </MapLayers>
  <MapZoomControl />
  <MapFullscreenControl position="bottom-right" />
</Map>`}
			>
				<div className={styles.mapFrame}>
					<Map center={MARLOW} zoom={13}>
						<MapLayers defaultTileLayer="Streets" defaultLayerGroups={["Venues"]}>
							<MapTileLayer name="Streets" />
							<MapTileLayer
								name="Terrain"
								url="https://tile.opentopomap.org/{z}/{x}/{y}.png"
								attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
							/>
							<MapLayerGroup name="Venues">
								{VENUES.map((venue) => (
									<MapMarker key={venue.id} position={venue.position} ariaLabel={venue.name}>
										<MapTooltip>{venue.name}</MapTooltip>
										<MapPopup>
											<Text weight="semibold">{venue.name}</Text>
											<Text size="sm" type="secondary">{venue.capacity} seated</Text>
										</MapPopup>
									</MapMarker>
								))}
							</MapLayerGroup>
							<MapLayersControl />
						</MapLayers>

						<MapZoomControl />
						<MapFullscreenControl position="bottom-right" />
						<MapLocateControl position="bottom-right" />
					</Map>
				</div>
			</Example>

			<Example
				id="draw"
				title="Drawing"
				description="One shape per press: the tool disarms as soon as the shape lands, because staying armed means the next click draws another. Edit and Delete stay disabled until something is drawn, and leaving either mode commits — leaflet-draw stages changes until save() runs."
				stacked
				code={`<Map center={center} zoom={13}>
  <MapTileLayer />
  <MapDrawControl onLayersChange={(group) => save(group.toGeoJSON())}>
    <MapDrawMarker />
    <MapDrawPolyline />
    <MapDrawPolygon />
    <MapDrawRectangle />
    <MapDrawCircle />
    <MapDrawEdit />
    <MapDrawDelete />
    <MapDrawUndo />
  </MapDrawControl>
</Map>`}
			>
				<div className={styles.mapFrame}>
					<Map center={MARLOW} zoom={13}>
						<MapTileLayer />
						<MapZoomControl />
						<MapDrawControl onLayersChange={(group) => setShapes(group.getLayers().length)}>
							<MapDrawMarker />
							<MapDrawPolyline />
							<MapDrawPolygon />
							<MapDrawRectangle />
							<MapDrawCircle />
							<MapDrawEdit />
							<MapDrawDelete />
							<MapDrawUndo />
						</MapDrawControl>
					</Map>
				</div>
				<Text size="sm" type="secondary">
					shapes drawn: <Badge tone="neutral">{shapes}</Badge>
				</Text>
			</Example>

			<Example
				id="place-autocomplete"
				title="Place autocomplete"
				description="A field that turns typing into places, backed by Photon — free, key-less, and OpenStreetMap-derived, which makes it the only geocoder that works with no configuration. It is also rate-limited, which is what searchUrl is for."
				stacked
				code={`<PlaceAutocomplete
  limit={5}
  onPlaceSelect={(feature) => {
    const [lon, lat] = feature.geometry.coordinates
    map.flyTo([lat, lon], 15)
  }}
/>

// Inside a map, as a control:
<MapSearchControl position="top-left" />`}
			>
				<div className={styles.mapSearch}>
					<PlaceAutocomplete limit={5} onPlaceSelect={setPlace} />
				</div>
				{!!place && (
					<Text size="sm" type="secondary" numeric>
						{place.properties.name} — {place.geometry.coordinates[1].toFixed(4)},{" "}
						{place.geometry.coordinates[0].toFixed(4)}
					</Text>
				)}

				<div className={styles.mapFrame}>
					<Map center={MARLOW} zoom={13}>
						<MapTileLayer />
						<MapSearchControl position="top-left" limit={5} />
						<MapZoomControl position="top-right" />
					</Map>
				</div>
			</Example>

			<Example id="map-rules" title="What the map decides" stacked>
				<Callout label="Rule">
					Leaflet and its plugins are <strong>optional peers</strong>, imported only when a map
					mounts — they are around 200KB and they touch <code>window</code> at import time, and
					most pages that ship this kit never render a map. Install{" "}
					<code>leaflet</code>, <code>react-leaflet</code>, and whichever of{" "}
					<code>leaflet-draw</code>, <code>leaflet.fullscreen</code>, and{" "}
					<code>leaflet.markercluster</code> you use, and import their stylesheets yourself.
				</Callout>
				<Text size="sm" type="secondary">
					Leaflet's CSS is <strong>unlayered</strong>, and unlayered rules beat every layered
					one regardless of import order. So <code>.leaflet-container {"{"} background: #ddd{" "}
					{"}"}</code> wins over a themed background on the same element, and the map flashes
					light grey behind its tiles on a dark surface. Every rule here that has to beat
					Leaflet is qualified by its class, so specificity does the work and no{" "}
					<code>!important</code> is needed.
				</Text>
				<Text size="sm" type="secondary">
					Controls are ordinary children positioned over the tiles, not Leaflet controls: they
					are kit Buttons and DropdownMenus. All they borrow from Leaflet is its event
					suppression, so a click on a button is not also a click on the map.
				</Text>
			</Example>

			<Example id="map-api" title="API">
				<PropTable
					rows={[
						{ name: "Map center / zoom", type: "LatLngExpression / number", required: true, description: "Everything else from react-leaflet's MapContainer passes through, except zoomControl — MapZoomControl replaces it." },
						{ name: "Map height", type: "\"sm\" | \"md\" | \"lg\" | string", default: "\"md\"", description: "16 / 24 / 36rem, or any CSS length. A MINIMUM, not a fixed height — the map still grows to fill a flex parent that gives it room, which is what a map docked beside a list needs." },
						{ name: "Map surface", type: "\"framed\" | \"flush\"", default: "\"framed\"", description: "framed draws the border and radius the tiles need against a page of the same colour. flush removes both, for a map that IS the panel rather than one sitting inside it — a sheet's body, a full-bleed hero." },
						{ name: "MapTileLayer name / url / darkUrl", type: "string", description: "Registers itself with the enclosing MapLayers. Defaults to OpenStreetMap's own tiles — the only basemap that renders with no key. In dark mode it is inverted, since there is no key-less dark basemap; passing darkUrl removes the filter." },
						{ name: "MapLayers", type: "component", description: "Holds the registry. Tile layers become a radio group and layer groups a checkbox list in MapLayersControl — no array to keep in step with the children." },
						{ name: "MapLayers defaultTileLayer", type: "string", description: "Names a MapTileLayer. Naming nothing REPORTS through onError and shows the first layer, rather than throwing — a typo should not take down the page." },
						{ name: "MapMarker icon", type: "ReactNode", description: "Rendered to a string and handed to Leaflet as a div icon. The accessible name is written onto the element after Leaflet builds it, because Leaflet builds it outside React." },
						{ name: "MapMarkerClusterGroup icon", type: "(count) => ReactNode", description: "Receives how many markers the cluster holds." },
						{ name: "MapPopup / MapTooltip", type: "components", description: "MapTooltip takes a side and an offset; Leaflet's own tip is removed, because a single built-in tip cannot sit on a side this component chose." },
						{ name: "MapDrawControl onLayersChange", type: "(group) => void", description: "Fires on create, edit, and delete, with the FeatureGroup — call toGeoJSON() on it to persist." },
						{ name: "MapLocateControl watch", type: "boolean", description: "Follows the device. The watch is stopped on unmount: one left running keeps the radio awake." },
						{ name: "PlaceAutocomplete searchUrl", type: "string", description: "Replaces the public Photon endpoint with your own, or with anything answering the same GeoJSON." },
						{ name: "usePlaceSearch", type: "hook", description: "The debounced, abort-safe lookup without the field. Every keystroke cancels the request before it." },
						{ name: "useLeaflet", type: "hook", description: "Leaflet itself once it has loaded, and null until then — for a consumer reaching for the imperative API." },
						{ name: "MapTileLayer name / url / attribution", type: "string", description: "A base map. Give it a name and it registers itself with MapLayers, which is how the layers control knows what to offer without being told twice." },
						{ name: "MapLayers defaultTileLayer / defaultLayerGroups / onError", type: "string / string[] / (error) => void", description: "The registry every named layer reports into. onError fires when a default names nothing — a typo that would otherwise show an empty map and no reason for it." },
						{ name: "MapLayerGroup / MapFeatureGroup name / disabled", api: ["MapLayerGroup.name", "MapLayerGroup.disabled", "MapFeatureGroup.name", "MapFeatureGroup.disabled"], type: "string / boolean", description: "A toggleable group of overlays. A feature group also answers as one shape for events and bounds, which is what the drawing tools edit against." },
						{ name: "MapLayersControl position / tileLayersLabel / layerGroupsLabel", type: "MapControlPosition / string", description: "The layer picker. It throws when mounted outside MapLayers rather than rendering an empty menu, because a control with nothing to control is a wiring mistake, not a state." },
						{ name: "MapMarkerClusterGroup", type: "component", description: "Collapses markers into counted clusters as the map zooms out. Above a few hundred pins the map stops being readable and starts being a texture." },
						{ name: "MapCircle / MapCircleMarker / MapPolyline / MapPolygon / MapRectangle", type: "component", description: "The shape primitives, taking the kit\u2019s tokens for stroke and fill so a drawn area matches the surface it sits on. MapCircleMarker is sized in pixels and MapCircle in metres — the difference matters the moment someone zooms." },
						{ name: "MapPopup / MapTooltip", type: "component", description: "Attached to a marker or a shape: a popup is clicked open and stays, a tooltip follows the pointer. A popup is where an action belongs; a tooltip cannot hold one." },
						{ name: "MapControlContainer position", type: "MapControlPosition", description: "The frame every control sits in. Beyond placement its job is suppressing Leaflet\u2019s own handlers — without it a click on a button also pans the map and a scroll over a menu also zooms it." },
						{ name: "MapFullscreenControl / MapLocateControl / MapSearchControl", type: "component", description: "Fullscreen, find-me, and place search. Locate draws a pulse at the fix rather than only recentring, because a map that jumps with no mark leaves the reader hunting for what moved." },
						{ name: "MapDrawControl", type: "component", description: "The drawing toolbar. It composes the tool buttons below, so a caller who wants only two of them mounts those two instead of configuring the toolbar out." },
						{ name: "MapDrawMarker / MapDrawPolyline / MapDrawPolygon / MapDrawRectangle / MapDrawCircle", type: "component", description: "One button per shape. Each takes Leaflet\u2019s own draw options for that shape, so nothing is re-declared here." },
						{ name: "MapDrawEdit / MapDrawDelete / MapDrawUndo", type: "component", description: "Edit and delete act on the feature group; undo steps back through the current drawing rather than the whole session, which is what a reader means by undo mid-shape." },
						{ name: "useLeaflet", type: "hook", description: "The resolved Leaflet module and react-leaflet\u2019s hooks. Everything here is lazy: Leaflet and its plugins are ~200KB, they touch window at import time, and most pages that ship this kit never render a map. The provider is what lets a control call useMap normally instead of managing its own load state." },
						{ name: "usePlaceSearch", type: "hook", description: "The geocoding search behind PlaceAutocomplete, for a caller building their own field against the same debounce, abort and result shape." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
