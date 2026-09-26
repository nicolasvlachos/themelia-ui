/**
 * PlaceAutocomplete: a text field that turns typing into places.
 *
 * Defaults to the free, key-less, rate-limited Photon geocoder (`photon.komoot.io`); set
 * `searchUrl` for production. The list closes on explicit dismissal or a pick, not on blur
 * (a blur fires as the pointer goes down on a result).
 */
import { Loader2Icon, MapPinIcon, SearchIcon } from "lucide-react"
import {
	useEffect, useState, type ComponentProps, type FocusEvent,
} from "react"

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/base/command"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/base/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Text } from "@/components/base/typography"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { defaultPlaceAutocompleteStrings, type PlaceAutocompleteStrings } from "./map.strings"
import styles from "./map.module.css"
import { formatAddress, usePlaceSearch } from "./place-search"

/** How long the field waits after the last keystroke before asking. */
const DEFAULT_DEBOUNCE_MS = 300

export type BBox = [number, number, number, number]

export interface PlaceFeatureProperties {
	osm_id: number
	osm_type: "N" | "W" | "R"
	osm_key: string
	osm_value: string
	type: string
	name?: string
	housenumber?: string
	street?: string
	locality?: string
	district?: string
	postcode?: string
	city?: string
	county?: string
	state?: string
	country?: string
	countrycode?: string
	extent?: [number, number, number, number]
	extra?: Record<string, string>
}

export interface PlaceFeature {
	type: "Feature"
	geometry: { type: "Point"; coordinates: [number, number] }
	properties: PlaceFeatureProperties
	bbox?: BBox
}

export interface PlaceFeatureCollection {
	type: "FeatureCollection"
	features: PlaceFeature[]
	bbox?: BBox
}

/** Photon's query parameters. @see https://github.com/komoot/photon#photon-api */
export interface PlaceSearchOptions {
	query: string
	lang?: string
	limit?: number
	/** [minLon, minLat, maxLon, maxLat]; results are restricted to it. */
	bbox?: BBox
	/** Biases results toward a point rather than restricting them. */
	lat?: number
	lon?: number
	/** How local the bias is. */
	zoom?: number
	/** How strong it is. */
	locationBiasScale?: number
}

export interface UsePlaceSearchOptions extends PlaceSearchOptions {
	debounceMs?: number
	searchUrl?: string
}

export interface PlaceAutocompleteProps
	extends Omit<PlaceSearchOptions, "query">,
		Omit<ComponentProps<"input">, "value" | "onChange"> {
	debounceMs?: number
	/** Replaces the public, rate-limited Photon endpoint; anything answering Photon's GeoJSON works. */
	searchUrl?: string
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	onPlaceSelect?: (feature: PlaceFeature) => void
	/** Every result, whenever they change, e.g. for a map that pins them all. */
	onResultsChange?: (results: PlaceFeature[]) => void
	strings?: Partial<PlaceAutocompleteStrings>
}

export function PlaceAutocomplete({
	debounceMs = DEFAULT_DEBOUNCE_MS,
	searchUrl,
	lang,
	limit = 5,
	bbox,
	lat,
	lon,
	zoom,
	locationBiasScale,
	className,
	value,
	defaultValue = "",
	onValueChange,
	onPlaceSelect,
	onResultsChange,
	strings,
	onFocus,
	...props
}: PlaceAutocompleteProps) {
	const copy = { ...defaultPlaceAutocompleteStrings, ...strings }

	const [internalValue, setInternalValue] = useState(defaultValue)
	/* The searched text is not the field text: writing a chosen address must not search again. */
	const [query, setQuery] = useState("")
	const [dismissed, setDismissed] = useState(false)

	const isControlled = value !== undefined
	const shown = isControlled ? value : internalValue

	const { results, isLoading, error, hasSearched } = usePlaceSearch({
		query, debounceMs, searchUrl, lang, limit, bbox, lat, lon, zoom, locationBiasScale,
	})

	useEffect(() => {
		onResultsChange?.(results)
	}, [onResultsChange, results])

	const noResults = hasSearched && !isLoading && !error && results.length === 0
	const hasList = !!error || noResults || results.length > 0

	const commit = (feature: PlaceFeature) => {
		const address = formatAddress(feature.properties)
		if (!isControlled) setInternalValue(address)
		setQuery("")
		setDismissed(true)
		onValueChange?.(address)
		onPlaceSelect?.(feature)
	}

	return (
		<Command
			data-slot="place-autocomplete"
			className={cx("place-autocomplete--component", styles.autocomplete, className)}
			// The geocoder already ranked the results; filtering on their osm_id values would hide everything.
			shouldFilter={false}
			loop
		>
			<Popover open={hasList && !dismissed} onOpenChange={(open) => !open && setDismissed(true)}>
				<div className={styles.autocompleteAnchor}>
					{/* An inert anchor: the popup opens from the field's state, and a focusable trigger would take its clicks. */}
					<PopoverTrigger
						render={<span />}
						nativeButton={false}
						tabIndex={-1}
						aria-hidden="true"
						className={styles.autocompleteTrigger}
					/>

					<InputGroup className={styles.autocompleteField}>
						<InputGroupAddon>
							<SearchIcon />
						</InputGroupAddon>
						<InputGroupInput
							placeholder={copy.searchPlaceholder}
							value={shown}
							onChange={(event) => {
								const next = event.target.value
								if (!isControlled) setInternalValue(next)
								setDismissed(false)
								setQuery(next)
								onValueChange?.(next)
							}}
							onFocus={(event: FocusEvent<HTMLInputElement>) => {
								if (hasList) setDismissed(false)
								onFocus?.(event)
							}}
							{...props}
						/>
						{isLoading && (
							<InputGroupAddon align="inline-end">
								<Loader2Icon aria-hidden className={styles.spin} />
								<VisuallyHidden>{copy.loading}</VisuallyHidden>
							</InputGroupAddon>
						)}
					</InputGroup>
				</div>

				<PopoverContent
					align="start"
					sideOffset={4}
					initialFocus={false}
					finalFocus={false}
					className={styles.autocompleteResults}
				>
					<CommandList className={styles.autocompleteList}>
						{!!error && (
							<CommandEmpty>
								<Text tag="span" size="xs" type="secondary" align="center">
									{copy.error(error.message)}
								</Text>
							</CommandEmpty>
						)}

						{noResults && (
							<CommandEmpty>
								<Text tag="span" size="xs" type="secondary" align="center">
									{copy.noResults(shown)}
								</Text>
							</CommandEmpty>
						)}

						{results.length > 0 && (
							<CommandGroup>
								{results.map((feature) => (
									<CommandItem
										key={feature.properties.osm_id}
										value={String(feature.properties.osm_id)}
										onSelect={() => commit(feature)}
									>
										<MapPinIcon />
										<span className={styles.autocompleteRow}>
											<Text tag="span" weight="medium">
												{feature.properties.name ||
													feature.properties.street ||
													copy.unknownPlace}
											</Text>
											<Text tag="span" size="xs" type="secondary">
												{formatAddress(feature.properties)}
											</Text>
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</PopoverContent>
			</Popover>
		</Command>
	)
}
