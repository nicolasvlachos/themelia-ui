import { useState } from "react"

import { Text } from "themelia-ui/base/typography"
import {
	Map, MapSearchControl, MapTileLayer, MapZoomControl, PlaceAutocomplete, type PlaceFeature,
} from "themelia-ui/features/map"

import styles from "../../preview.module.css"
import { MARLOW } from "./data"

export default function PlaceAutocompleteExample() {
	const [place, setPlace] = useState<PlaceFeature | null>(null)

	return (
		<>
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
		</>
	)
}
