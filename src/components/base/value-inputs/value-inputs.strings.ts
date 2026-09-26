import { defaultInputStrings, type InputStrings } from "@/components/base/text-inputs"

/* A field whose props extend Input's has strings extending Input's, to name its affordances. */
export interface SliderStrings {
	/** Names each thumb of a range, by index. */
	thumb: (index: number) => string
	/**
	 * Names a single-thumb slider given no `aria-label` or `aria-labelledby`. Optional so
	 * older complete strings objects still type-check.
	 */
	label?: string
}

export const defaultSliderStrings: SliderStrings = {
	thumb: (index) => (index === 0 ? "Minimum" : "Maximum"),
	label: "Value",
}

export interface ColorInputStrings extends InputStrings {
	/** Names the swatch, which is a control (the native picker sits under it). */
	picker: string
}

export const defaultColorInputStrings: ColorInputStrings = {
	...defaultInputStrings,
	picker: "Choose a colour",
}

export interface PhoneInputStrings extends InputStrings {
	/** Placeholder in the dial-code lane. */
	prefixPlaceholder: string
	/** Names that lane, which has no visible label of its own. */
	prefix: string
}

export const defaultPhoneInputStrings: PhoneInputStrings = {
	...defaultInputStrings,
	prefixPlaceholder: "Code",
	prefix: "Country dial code",
}

export interface TagsInputStrings extends InputStrings {
	/** The control that empties the field. */
	clearAll: string
	/** Names each tag's remove control, by the tag it removes. */
	removeTag: (tag: string) => string
	/** The empty field's prompt. The `placeholder` prop overrides it for one instance. */
	placeholder: string
	/**
	 * Announced when a commit leaves entries it could not add (duplicate, refused, full).
	 * Optional so older complete strings objects still type-check.
	 */
	notAdded?: (entries: string) => string
}

export const defaultTagsInputStrings: TagsInputStrings = {
	...defaultInputStrings,
	clearAll: "Clear all",
	removeTag: (tag) => `Remove ${tag}`,
	notAdded: (entries) => `Not added: ${entries}.`,
	placeholder: "Add a tag…",
}
