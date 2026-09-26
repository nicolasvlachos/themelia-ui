import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	Map, MapSearchControl, MapTileLayer, MapZoomControl, PlaceAutocomplete, type PlaceFeature,
} from "themelia-ui/features/map"

import { MARLOW } from "./data"

export default function PlaceAutocompleteExample() {
	const [place, setPlace] = useState<PlaceFeature | null>(null)

	return (
		<>
			<Stack maxWidth="24rem">
				<PlaceAutocomplete limit={5} onPlaceSelect={setPlace} />
			</Stack>
			{!!place && (
				<Text size="sm" type="secondary" numeric>
					{place.properties.name} — {place.geometry.coordinates[1].toFixed(4)},{" "}
					{place.geometry.coordinates[0].toFixed(4)}
				</Text>
			)}

			<Map center={MARLOW} zoom={13} height="26rem">
				<MapTileLayer />
				<MapSearchControl position="top-left" limit={5} />
				<MapZoomControl position="top-right" />
			</Map>
		</>
	)
}
