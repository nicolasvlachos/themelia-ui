/* One product, the Trailhead 29er, behind every card on the page. Values arrive formatted. */

export const READINESS = [
	{ id: "media", label: "Photography", description: "Six shots, one on white.", completed: true, value: "6 of 6" },
	{ id: "copy", label: "Description", description: "Long and short copy, both locales.", completed: true, value: "Done" },
	{ id: "price", label: "Pricing", description: "No price on the 29er frameset.", tone: "warning" as const, value: "1 missing", actionLabel: "Fix" },
	{ id: "ship", label: "Shipping profile", description: "Oversize carrier not chosen.", tone: "destructive" as const, value: "Blocked", actionLabel: "Choose" },
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

export const QUOTE = [
	{ id: "base", label: "Frameset", description: "Trailhead 29er, size M", value: "€1,240" },
	{ id: "build", label: "Expedition build kit", value: "€980" },
	{ id: "carrier", label: "Oversize carrier", description: "Not yet chosen — estimated", value: "€120", tone: "warning" as const },
	{ id: "rebate", label: "Volume rebate", value: "−€72", tone: "success" as const },
	{ id: "total", label: "Total", value: "€2,268", emphasis: true },
]
