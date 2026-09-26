/*
 * Leaflet's stylesheets are the consumer's import, not the kit's. They are unlayered, so
 * features/map out-specifies a few rules (map.module.css).
 */
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.fullscreen/dist/Control.FullScreen.css"

import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MapPage() {
	return (
		<ComponentPage>
			<Example
				example="map/map"
				title="A map with controls"
				description="Zoom, layers, fullscreen, locate, and search — each an ordinary child positioned over the tiles, built from the kit's own Button and DropdownMenu rather than Leaflet's hand-built control DOM. The default basemap is OpenStreetMap's own, because it is the only one that renders with no key — and in dark mode it is inverted, since there is no key-less dark basemap to pair with it."
			/>

			<Example
				example="map/draw"
				title="Drawing"
				description="One shape per press: the tool disarms as soon as the shape lands, because staying armed means the next click draws another. Edit and Delete stay disabled until something is drawn, and leaving either mode commits — leaflet-draw stages changes until save() runs."
			/>

			<Example
				example="map/place-autocomplete"
				title="Place autocomplete"
				description="A field that turns typing into places, backed by Photon — free, key-less, and OpenStreetMap-derived, which makes it the only geocoder that works with no configuration. It is also rate-limited, which is what searchUrl is for."
			/>

			<Example id="map-rules" title="What the map decides">
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
					owners={[
						"Map",
						"MapTileLayer",
						"MapLayers",
						"MapLayerGroup",
						"MapFeatureGroup",
						"MapLayersControl",
						"MapMarker",
						"MapMarkerClusterGroup",
						"MapTooltip",
						"MapControlContainer",
						"MapLocateControl",
						"MapDrawControl",
						"PlaceAutocomplete",
					]}
				/>
				<PropTable
					symbols={[
						"MapPopup",
						"MapCircle",
						"MapCircleMarker",
						"MapPolyline",
						"MapPolygon",
						"MapRectangle",
						"MapFullscreenControl",
						"MapSearchControl",
						"MapDrawMarker",
						"MapDrawPolyline",
						"MapDrawPolygon",
						"MapDrawRectangle",
						"MapDrawCircle",
						"MapDrawEdit",
						"MapDrawDelete",
						"MapDrawUndo",
						"useLeaflet",
						"usePlaceSearch",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
