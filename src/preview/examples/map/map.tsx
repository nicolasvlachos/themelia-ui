import { Text } from "themelia-ui/base/typography"
import {
	Map, MapFullscreenControl, MapLayerGroup, MapLayers, MapLayersControl, MapLocateControl,
	MapMarker, MapPopup, MapTileLayer, MapTooltip, MapZoomControl,
} from "themelia-ui/features/map"

import styles from "../../preview.module.css"
import { MARLOW } from "./data"

const VENUES: { id: string; name: string; position: [number, number]; capacity: number }[] = [
	{ id: "v1", name: "Marlow Hall", position: [51.5687, -0.7746], capacity: 180 },
	{ id: "v2", name: "The Old Granary", position: [51.5731, -0.7692], capacity: 60 },
	{ id: "v3", name: "Riverside Rooms", position: [51.5642, -0.7801], capacity: 240 },
]

export default function MapExample() {
	return (
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
	)
}
