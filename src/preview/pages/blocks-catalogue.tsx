import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BlocksCataloguePage() {
	return (
		<ComponentPage>
			<Example
				example="blocks-catalogue/catalogue-seo"
				title="SeoListing"
				description="A search-result preview and a compact quality checklist. Edit either listing to change its content and recalculate the score."
			/>

			<Example
				example="blocks-catalogue/catalogue-inventory"
				title="InventorySection"
				description="Stock levels at a glance, followed by grouped product, tracking, location, shipping, and customs fields. Edits update the controlled record; toggling tracking preserves its quantities."
			/>

			<Example
				example="blocks-catalogue/catalogue-vendor"
				title="VendorProfile"
				description="Supplier identity, operating facts, and performance in distinct sections. Switch tabs to compare performance; action callbacks belong to your application."
			/>

			<Example
				example="blocks-catalogue/catalogue-booking"
				title="BookingCard"
				description="Reservation identity and status, paired booking facts, and a separate note and action."
			/>

			<Example id="catalogue-props" title="Props">
				<Callout>
					<code>InventorySection</code> never validates. What counts as a valid SKU, weight
					or HS code is the consumer's rule, and a component that guessed would fight them.
					It reports edits; deciding whether one is allowed stays at the call site.
				</Callout>
				<PropTable
					rows={[
						{ name: "SeoListing listing", type: "SeoScoreInput", required: true, description: "title, description, permalink, baseUrl, keyword, and optional limits. Scored on render unless a score is supplied." },
						{ name: "SeoListing score", type: "SeoScore", description: "A score computed elsewhere — by an editor scoring as the user types. Without it the card scores the listing itself." },
						{ name: "calculateSeoScore", type: "(input) => SeoScore", description: "Plain function, no React. Returns the total, a status, and a per-check breakdown with the measured lengths." },
						{ name: "InventorySection value", type: "InventorySectionValue", required: true, description: "sku, barcode, trackQuantity, available, committed, incoming, lowStockThreshold, inventoryPolicy, binLocation, requiresShipping, weight, countryOfOrigin, hsCode, tags." },
						{ name: "InventorySection onFieldChange", type: "({ field, value, previousValue }) => void", description: "Reports what it replaced as well as what it is now — an undo stack that has to remember that itself is one that gets it wrong once." },
						{ name: "InventorySection sections", type: "InventorySectionName[]", default: "all", description: "Narrows what is drawn, so one surface serves a simple product, a variant and a location record without forking." },
						{ name: "VendorProfile metrics / stats", type: "VendorMetric[] / VendorStat[]", description: "Supplying both gives tabs; supplying either alone renders that view bare." },
						{ name: "VendorProfile view / onViewChange", type: "VendorView / (view) => void", description: "Controlled. Uncontrolled it opens on whichever view has data." },
						{ name: "BookingCard details", type: "BookingDetail[]", required: true, description: "Rendered as a real <dl>, so a screen reader pairs each value with its own label. fullWidth spans the row and gets its own ground." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
