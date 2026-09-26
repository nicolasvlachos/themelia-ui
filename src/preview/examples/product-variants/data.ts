/* The Trailhead 29er's options and the variants they generate. */
import type { ProductOptionGroup, ProductVariantRow } from "themelia-ui/features/products"

/* Inline SVG, not a URL, so the thumbnails render the same offline. */
const swatch = (fill: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="2" height="2" fill="${fill}"/></svg>`,
	)}`

const SLATE_SWATCH = swatch("#64748b")
const MOSS_SWATCH = swatch("#84a059")

export const OPTION_SUMMARY = [
	{ id: "size", label: "Frame size", values: ["S", "M", "L"], description: "Drives the variant grid." },
	{ id: "colour", label: "Colour", values: ["Slate", "Moss", "Rust"] },
	{ id: "build", label: "Build kit", values: ["Trail", "Expedition"], description: "Groupset and wheels." },
]

export const OPTION_GROUPS: ProductOptionGroup[] = [
	{
		id: "size",
		name: "Frame size",
		description: "Measured to the seat tube.",
		position: 0,
		values: [
			{ id: "s", label: "S" },
			{ id: "m", label: "M" },
			{ id: "l", label: "L" },
		],
	},
	{
		id: "build",
		name: "Build kit",
		description: "Groupset and wheels.",
		position: 1,
		values: [
			{ id: "trail", label: "Trail" },
			{ id: "expedition", label: "Expedition" },
		],
	},
]

export const VARIANTS: ProductVariantRow[] = [
	{ id: "s-trail", name: "S · Trail", image: SLATE_SWATCH, imageAlt: "Slate frame", sku: "TRL-29-S-TR", price: "€1,850", inventory: "12", status: "Live", statusTone: "success", optionValues: { size: "S", build: "Trail" }, optionValueIds: { size: "s", build: "trail" }, updatedAt: "2 days ago" },
	{ id: "s-exp", name: "S · Expedition", sku: "TRL-29-S-EX", price: "€2,340", inventory: "4", status: "Live", statusTone: "success", optionValues: { size: "S", build: "Expedition" }, optionValueIds: { size: "s", build: "expedition" }, updatedAt: "2 days ago" },
	{ id: "m-trail", name: "M · Trail", image: MOSS_SWATCH, imageAlt: "Moss frame", sku: "TRL-29-M-TR", price: "€1,850", inventory: "31", status: "Live", statusTone: "success", optionValues: { size: "M", build: "Trail" }, optionValueIds: { size: "m", build: "trail" }, updatedAt: "yesterday" },
	{ id: "m-exp", name: "M · Expedition", sku: "TRL-29-M-EX", price: "€2,340", inventory: "0", status: "Sold out", statusTone: "warning", optionValues: { size: "M", build: "Expedition" }, optionValueIds: { size: "m", build: "expedition" }, updatedAt: "yesterday" },
	{ id: "l-trail", name: "L · Trail", sku: "TRL-29-L-TR", price: "€1,850", inventory: "9", status: "Live", statusTone: "success", optionValues: { size: "L", build: "Trail" }, optionValueIds: { size: "l", build: "trail" }, updatedAt: "last week" },
	{ id: "l-exp", name: "L · Expedition", sku: "", price: "", inventory: "0", status: "Draft", statusTone: "neutral", optionValues: { size: "L", build: "Expedition" }, optionValueIds: { size: "l", build: "expedition" }, updatedAt: "last week" },
]
