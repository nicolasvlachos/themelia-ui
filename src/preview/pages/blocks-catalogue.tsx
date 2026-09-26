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
				<PropTable owners={["SeoListing", "InventorySection", "VendorProfile", "BookingCard"]} />
				<PropTable symbols={["calculateSeoScore"]} />
			</Example>
		</ComponentPage>
	)
}
