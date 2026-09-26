/** One catalogue shared by both Commerce pages, so the same product runs through both. */
import { BoxIcon, LayersIcon, WarehouseIcon } from "lucide-react"

import type { ProductOptionGroup, ProductVariantRow } from "@/components/features"

/* Inline SVG, not a URL, so visual baselines do not depend on a third party. */
const swatch = (fill: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="2" height="2" fill="${fill}"/></svg>`,
	)}`

const SLATE_SWATCH = swatch("#64748b")
const MOSS_SWATCH = swatch("#84a059")

export const READINESS = [
	{ id: "media", label: "Photography", description: "Six shots, one on white.", completed: true, value: "6 of 6" },
	{ id: "copy", label: "Description", description: "Long and short copy, both locales.", completed: true, value: "Done" },
	{ id: "price", label: "Pricing", description: "No price on the 29er frameset.", tone: "warning" as const, value: "1 missing", actionLabel: "Fix" },
	{ id: "ship", label: "Shipping profile", description: "Oversize carrier not chosen.", tone: "destructive" as const, value: "Blocked", actionLabel: "Choose" },
]

export const STRUCTURE = [
	{ id: "variants", label: "Variants", value: "18", description: "3 sizes × 3 colours × 2 builds", icon: <LayersIcon /> },
	{ id: "skus", label: "Live SKUs", value: "14", description: "4 held back for launch", tone: "primary" as const, icon: <BoxIcon /> },
	{ id: "stock", label: "On hand", value: "212", description: "Across two warehouses", icon: <WarehouseIcon /> },
]

export const OPERATIONS = [
	{ id: "fulfil", label: "Fulfilment", description: "Shipped from Rotterdam.", value: "In house" },
	{ id: "lead", label: "Lead time", description: "Working days after payment clears.", value: "3–5 days" },
	{ id: "carrier", label: "Oversize carrier", description: "Frames exceed the standard parcel limit.", value: "Not set", tone: "warning" as const, actionLabel: "Choose" },
]

export const DETAILS = [
	{ id: "sku", label: "Base SKU", value: { kind: "mono" as const, value: "TRL-29" } },
	{ id: "brand", label: "Brand", value: "Trailhead" },
	{ id: "category", label: "Category", value: "Mountain bikes" },
	{ id: "warranty", label: "Warranty", value: "5 years, frame only" },
]

export const CONTRACT_METRICS = [
	{ id: "margin", label: "Blended margin", value: "38%", description: "After carrier surcharge", tone: "success" as const },
	{ id: "floor", label: "Price floor", value: "€1,750", description: "Set by the distributor" },
	{ id: "moq", label: "Minimum order", value: "12 units" },
]

export const CONTRACT_TERMS = [
	{ id: "term", label: "Term", value: "1 Jan 2026 – 31 Dec 2026" },
	{ id: "notice", label: "Notice", value: "90 days" },
	{ id: "rebate", label: "Volume rebate", value: "3% over 500 units" },
	{ id: "owner", label: "Owner", value: { kind: "email" as const, value: "supply@trailhead.eu" } },
]

export const RULES = [
	{ id: "map", label: "No discount below the floor", description: "Rejected at checkout, not hidden.", value: "Enforced", tone: "success" as const },
	{ id: "bundle", label: "Frameset excluded from bundles", description: "Distributor terms, clause 6.", value: "Enforced", tone: "success" as const },
	{ id: "region", label: "Not sold outside the EU", description: "Expires with the current term.", value: "Review", tone: "warning" as const },
]

export const POLICIES = [
	{ id: "returns", label: "Returns", description: "30 days, unridden, original packaging.", value: "30 days" },
	{ id: "assembly", label: "Assembly", description: "Shipped 90% built; bars and pedals by the buyer.", value: "Partial" },
	{ id: "recall", label: "Recall contact", description: "Notified within 24 hours of a supplier notice.", value: "Set", tone: "success" as const },
]

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

export const QUOTE = [
	{ id: "base", label: "Frameset", description: "Trailhead 29er, size M", value: "€1,240" },
	{ id: "build", label: "Expedition build kit", value: "€980" },
	{ id: "carrier", label: "Oversize carrier", description: "Not yet chosen — estimated", value: "€120", tone: "warning" as const },
	{ id: "rebate", label: "Volume rebate", value: "−€72", tone: "success" as const },
	{ id: "total", label: "Total", value: "€2,268", emphasis: true },
]
