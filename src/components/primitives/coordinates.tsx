/**
 * Coordinates: latitude and longitude at a meaningful precision (default five places,
 * about a metre), in decimal or degrees-minutes-seconds form.
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { defaultCoordinatesStrings, type CoordinatesStrings } from "./primitives.strings"

export interface CoordinatesProps extends SpanProps {
	latitude?: number | null
	longitude?: number | null
	/** `decimal` is "48.85837, 2.29448"; `dms` is "48°51'30.1\"N 2°17'40.1\"E". */
	format?: "decimal" | "dms"
	/** Decimal places in `decimal` form. Five is about a metre. */
	precision?: number
	/**
	 * Adds hemisphere letters to the decimal form: "48.85837°N, 2.29448°E". Off by default
	 * (a signed pair pastes into a map); `dms` always shows them.
	 */
	showHemisphere?: boolean
	locale?: string
	strings?: Partial<CoordinatesStrings>
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

function toDms(value: number, positive: string, negative: string) {
	const hemisphere = value < 0 ? negative : positive
	// Round once before splitting, so 59.96 seconds carries into the next minute.
	const tenths = Math.round(Math.abs(value) * 36000)
	const degrees = Math.floor(tenths / 36000)
	const minutes = Math.floor((tenths % 36000) / 600)
	const seconds = (tenths % 600) / 10
	return `${degrees}°${String(minutes).padStart(2, "0")}'${seconds.toFixed(1).padStart(4, "0")}"${hemisphere}`
}

export function Coordinates({
	latitude,
	longitude,
	format = "decimal",
	precision = 5,
	showHemisphere = false,
	locale,
	strings,
	align,
	...props
}: CoordinatesProps) {
	const { locale: scopeLocale } = useFormatting()
	const copy = { ...defaultCoordinatesStrings, ...strings }
	const resolved = locale ?? scopeLocale

	const missing =
		latitude === null ||
		latitude === undefined ||
		longitude === null ||
		longitude === undefined ||
		!Number.isFinite(latitude) ||
		!Number.isFinite(longitude)

	let text: string | undefined
	if (!missing) {
		if (format === "dms") {
			text = `${toDms(latitude, copy.north, copy.south)} ${toDms(longitude, copy.east, copy.west)}`
		} else {
			const number = new Intl.NumberFormat(resolved, {
				minimumFractionDigits: precision,
				maximumFractionDigits: precision,
			})
			text = showHemisphere
				? `${number.format(Math.abs(latitude))}°${latitude < 0 ? copy.south : copy.north}, ` +
					`${number.format(Math.abs(longitude))}°${longitude < 0 ? copy.west : copy.east}`
				: `${number.format(latitude)}, ${number.format(longitude)}`
		}
	}

	return (
		<ValueRoot hook="coordinates" numeric align={align} {...props}>
			{text}
		</ValueRoot>
	)
}
