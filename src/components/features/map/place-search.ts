/*
 * Place lookup and address formatting without the field, for custom autocompletes. Kept out
 * of the component file so that file keeps fast refresh.
 */
import { useEffect, useState } from "react"

import { useDebounce } from "@/hooks/use-debounce"

import type {
	PlaceFeature,
	PlaceFeatureCollection,
	PlaceFeatureProperties,
	PlaceSearchOptions,
	UsePlaceSearchOptions,
} from "./place-autocomplete"

const DEFAULT_DEBOUNCE_MS = 300

const PHOTON_URL = "https://photon.komoot.io/api"

function buildSearchUrl(base: string, options: PlaceSearchOptions): string {
	const url = new URL(base)
	url.searchParams.set("q", options.query)
	if (options.lang) url.searchParams.set("lang", options.lang)
	if (options.limit !== undefined) url.searchParams.set("limit", String(options.limit))
	if (options.bbox) url.searchParams.set("bbox", options.bbox.join(","))
	if (options.lat !== undefined) url.searchParams.set("lat", String(options.lat))
	if (options.lon !== undefined) url.searchParams.set("lon", String(options.lon))
	if (options.zoom !== undefined) url.searchParams.set("zoom", String(options.zoom))
	if (options.locationBiasScale !== undefined) {
		url.searchParams.set("location_bias_scale", String(options.locationBiasScale))
	}
	return String(url)
}


/** The address as a person would write it, deduplicated (a town is often its own city and state). */
export function formatAddress(properties: PlaceFeatureProperties): string {
	const parts: string[] = []

	if (properties.name) parts.push(properties.name)

	if (properties.housenumber && properties.street) {
		parts.push(`${properties.housenumber} ${properties.street}`)
	} else if (properties.street) {
		parts.push(properties.street)
	}

	if (properties.city) parts.push(properties.city)
	else if (properties.locality) parts.push(properties.locality)

	if (properties.state && properties.state !== properties.city) parts.push(properties.state)
	if (properties.country) parts.push(properties.country)

	return [...new Set(parts)].join(", ")
}

/** The lookup on its own, for a consumer building their own field. */
export function usePlaceSearch({
	debounceMs = DEFAULT_DEBOUNCE_MS,
	searchUrl = PHOTON_URL,
	query,
	lang,
	limit,
	bbox,
	lat,
	lon,
	zoom,
	locationBiasScale,
}: UsePlaceSearchOptions) {
	const [results, setResults] = useState<PlaceFeature[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const [hasSearched, setHasSearched] = useState(false)

	const debounced = useDebounce(query, debounceMs)

	useEffect(() => {
		if (!debounced.trim()) {
			// oxlint-disable-next-line react/set-state-in-effect -- the effect owns a network request; blanking results when the query stops qualifying is that request's lifecycle, not a value derivable from props
			setResults([])
			setIsLoading(false)
			setHasSearched(false)
			return
		}

		// Every keystroke aborts the previous request.
		const controller = new AbortController()

		async function run() {
			setIsLoading(true)
			setError(null)
			setHasSearched(true)

			try {
				const response = await fetch(
					buildSearchUrl(searchUrl, {
						query: debounced, lang, limit, bbox, lat, lon, zoom, locationBiasScale,
					}),
					{ signal: controller.signal },
				)
				if (!response.ok) {
					throw new Error(`Geocoder error: ${response.status} ${response.statusText}`)
				}

				const data = (await response.json()) as PlaceFeatureCollection
				// Photon returns the same OSM object under several types; the first wins.
				const seen = new Set<number>()
				setResults(
					data.features.filter((feature) => {
						if (seen.has(feature.properties.osm_id)) return false
						seen.add(feature.properties.osm_id)
						return true
					}),
				)
			} catch (caught) {
				// An abort is this hook's own doing, not a failure to report.
				if (caught instanceof Error && caught.name !== "AbortError") {
					setError(caught)
					setResults([])
				}
			} finally {
				setIsLoading(false)
			}
		}

		void run()
		return () => controller.abort()
	}, [bbox, debounced, lang, lat, limit, locationBiasScale, lon, searchUrl, zoom])

	return { results, isLoading, error, hasSearched }
}
