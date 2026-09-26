/* Product tone to Badge tone. Its own module so product-parts.tsx exports only components. */
import type { BadgeTone } from "@/components/base/badge"

import type { ProductTone } from "./products.types"
/** A product tone, as the Badge's vocabulary spells it. */
export const PRODUCT_TONE_BADGE: Record<ProductTone, BadgeTone> = {
	neutral: "neutral",
	primary: "primary",
	success: "success",
	warning: "warning",
	destructive: "destructive",
	info: "info",
}

