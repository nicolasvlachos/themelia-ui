export interface MapStrings {
	/** Names the tile layer that supplies no name of its own. */
	defaultTileLayer: string
	mapType: string
	layers: string
	selectLayers: string
	marker: string
	zoomControls: string
	zoomIn: string
	zoomOut: string
	enterFullscreen: string
	exitFullscreen: string
	locating: string
	stopTracking: string
	trackLocation: string
	stopLocationTracking: string
	startLocationTracking: string
	currentLocation: string
	drawMarker: string
	drawPolyline: string
	drawCircle: string
	drawRectangle: string
	drawPolygon: string
	editShapes: string
	removeShapes: string
	undoEdit: string
	undoRemove: string
	/** Leaflet-draw's own on-map tooltip while editing. */
	editInstructions: string
	removeInstructions: string
}

export const defaultMapStrings: MapStrings = {
	defaultTileLayer: "Default",
	mapType: "Map type",
	layers: "Layers",
	selectLayers: "Select layers",
	marker: "Map marker",
	zoomControls: "Zoom controls",
	zoomIn: "Zoom in",
	zoomOut: "Zoom out",
	enterFullscreen: "Enter fullscreen",
	exitFullscreen: "Exit fullscreen",
	locating: "Locating…",
	stopTracking: "Stop tracking",
	trackLocation: "Track location",
	stopLocationTracking: "Stop location tracking",
	startLocationTracking: "Start location tracking",
	currentLocation: "Current location",
	drawMarker: "Draw marker",
	drawPolyline: "Draw polyline",
	drawCircle: "Draw circle",
	drawRectangle: "Draw rectangle",
	drawPolygon: "Draw polygon",
	editShapes: "Edit shapes",
	removeShapes: "Remove shapes",
	undoEdit: "Undo edit",
	undoRemove: "Undo remove",
	editInstructions: "Drag handles or markers to edit.",
	removeInstructions: "Click a shape to remove it.",
}

export interface PlaceAutocompleteStrings {
	searchPlaceholder: string
	/** Announced while a lookup is in flight. */
	loading: string
	error: (message: string) => string
	noResults: (query: string) => string
	/** For a result the geocoder returned with no name and no street. */
	unknownPlace: string
}

export const defaultPlaceAutocompleteStrings: PlaceAutocompleteStrings = {
	searchPlaceholder: "Search",
	loading: "Searching places",
	error: (message) => `Error: ${message}`,
	noResults: (query) => `Can’t find “${query}”.`,
	unknownPlace: "Unknown",
}
