import { defaultInputStrings, type InputStrings } from "@/components/base/text-inputs"

/*
 * Strings inherit as the props do (Input → DecimalInput → CurrencyInput), so each field
 * accepts copy for everything it can render, including Input's clear and count.
 */
export interface DecimalInputStrings extends InputStrings {
	/** The steppers are icon-only, so these are the only names they have. */
	decrement: string
	increment: string
}

export const defaultDecimalInputStrings: DecimalInputStrings = {
	...defaultInputStrings,
	decrement: "Decrement",
	increment: "Increment",
}

/** Extends the decimal strings, because a currency field IS one, with a selector added. */
export interface CurrencyInputStrings extends DecimalInputStrings {
	/** Names the selector that changes what the number beside it MEANS. */
	currency: string
}

export const defaultCurrencyInputStrings: CurrencyInputStrings = {
	...defaultDecimalInputStrings,
	currency: "Currency",
}

export interface UnitInputStrings {
	/** Names the unit selector, which has no visible label of its own. */
	unit: string
}

export const defaultUnitInputStrings: UnitInputStrings = {
	unit: "Unit",
}

export interface DimensionsInputStrings extends UnitInputStrings {
	length: string
	width: string
	height: string
}

export const defaultDimensionsInputStrings: DimensionsInputStrings = {
	...defaultUnitInputStrings,
	length: "Length",
	width: "Width",
	height: "Height",
}

export interface CoordinatesInputStrings {
	latitude: string
	longitude: string
}

export const defaultCoordinatesInputStrings: CoordinatesInputStrings = {
	latitude: "Latitude",
	longitude: "Longitude",
}
