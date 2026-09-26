export {
	Value, SecondaryValue, MutedValue, MonoValue, EmptyValue,
	type ValueProps, type EmptyValueProps, type ValueType, type SpanProps,
} from "./value"
export { Name, type NameProps } from "./name"
export { formatName, type NameFormatOptions } from "./name.format"
export { Initials, type InitialsProps } from "./initials"
export {
	formatInitials, type InitialsFormatOptions,
	type InitialsStrategy, type InitialsMaxCharacters,
} from "./initials-format"
export {
	Link, Email, Phone, Url,
	type LinkProps, type EmailProps, type PhoneProps, type UrlProps,
} from "./link"
export {
	Money,
	type MoneyProps, type MoneyValue, type MoneyUnit,
} from "./money"
export { Number, Percent, type NumberProps, type PercentProps } from "./number"
export { FileSize, type FileSizeProps } from "./file-size"
export { formatFileSize, type FileSizeBase, type FileSizeFormatOptions, type FileSizeUnit } from "./file-size.format"
export { Duration, type DurationProps } from "./duration"
/* Unit vocabularies from `lib/format`, re-exported for prop typing. */
export type {
	DurationUnit, DurationUnitDisplay, FormatDurationOptions,
} from "@/lib/format"
export {
	Dimensions,
	type DimensionsProps,
} from "./dimensions"
export {
	DatePrimitive,
	DatePrimitive as Date,
	Time, DateTime, DateRange, RelativeTime,
 type DateBaseProps, type DateRangeProps, type RelativeTimeProps,
} from "./date"
export { formatDimensions, type DimensionPart, type FormatDimensionsOptions } from "./dimensions.format"
export { formatDateRange, parseDateInput, type DateInput, type FormatDateRangeOptions } from "./date.format"

export { Ratio, Rating } from "./ratio"
export type { RatioProps, RatingProps } from "./ratio"
export { Quantity, Measure } from "./quantity"
export type { QuantityProps, MeasureProps, PluralForms } from "./quantity"
export { InlineList } from "./inline-list"
export type { InlineListProps } from "./inline-list"
export { Coordinates } from "./coordinates"
export type { CoordinatesProps } from "./coordinates"
export { Range } from "./range"
export type { RangeProps } from "./range"
export { Address } from "./address"
export type { AddressProps } from "./address"
export { formatAddress, formatAddressLines, DEFAULT_ADDRESS_ORDER } from "./address.format"
export type { AddressParts, AddressField, AddressOrder, FormatAddressOptions } from "./address.format"
export {
	defaultRatioStrings, defaultRatingStrings, defaultInlineListStrings, defaultCoordinatesStrings,
} from "./primitives.strings"
export type {
	RatioStrings, RatingStrings, InlineListStrings, CoordinatesStrings,
} from "./primitives.strings"
