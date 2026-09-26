import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { Text } from "themelia-ui/base/typography"
import {
	Map, MapDrawCircle, MapDrawControl, MapDrawDelete, MapDrawEdit, MapDrawMarker,
	MapDrawPolygon, MapDrawPolyline, MapDrawRectangle, MapDrawUndo, MapTileLayer,
	MapZoomControl,
} from "themelia-ui/features/map"

import { MARLOW } from "./data"

export default function Draw() {
	const [shapes, setShapes] = useState(0)

	return (
		<>
			<Map center={MARLOW} zoom={13} height="26rem">
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
			<Text size="sm" type="secondary">
				shapes drawn: <Badge tone="neutral">{shapes}</Badge>
			</Text>
		</>
	)
}
