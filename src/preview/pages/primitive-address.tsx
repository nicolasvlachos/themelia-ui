import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveAddressPage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-address/address"
				title="Ordered by country"
				description="Germany puts the postcode before the city, Britain puts it last and alone, the United States runs city, state and ZIP together on one line. There is no Intl for this, so the kit ships three orderings keyed by country and takes an explicit order for anything else — rather than pretending to know every country and being wrong quietly, in someone else's."
			/>

			<Example
				example="primitive-address/address-inline"
				title="Inline, for a cell"
				description="The same ordering on one line. Both forms come from one function, so a city that moves line in the block form moves position here too and the two cannot disagree."
			/>

			<Example
				example="primitive-address/address-partial"
				title="Missing fields"
				description="An empty field drops out, and a line left with nothing drops with it — so a missing line2 never leaves a blank row in the middle of an address."
			/>

			<Example
				example="primitive-address/coordinates"
				title="Coordinates"
				description="A decimal degree is about 111km, so the decimals carry all the meaning. Five is the default because that is where the number stops being a neighbourhood and starts being a place — and because storing more than five and showing all of it is how 48.858370000000004 ends up on a page."
			/>

			<Example id="address-api" title="Address API">
				<PropTable owner="Address"
					rows={[
						{ name: "value", type: "AddressParts | null", description: "line1, line2, city, region, postalCode, country. Anything empty drops out." },
						{ name: "format", type: '"block" | "inline"', default: '"block"', description: "Block renders an <address> element with a line per row; inline renders a span for a cell or a summary." },
						{ name: "countryCode", type: "string | null", description: "An ISO code deciding the line order. Read from value.country when that looks like a code. Never inferred from the reader's locale — the locale is a language and the address is a place." },
						{ name: "order", type: "AddressOrder", description: "Overrides the ordering outright, for a country the kit does not know." },
						{ name: "formatAddressLines()", type: "(parts, options) => string[]", description: "The same ordering outside React." },
					]}
				/>
			</Example>

			<Example id="coordinates-api" title="Coordinates API">
				<PropTable owner="Coordinates"
					rows={[
						{ name: "latitude / longitude", type: "number | null", description: "Signed decimal degrees. Either one missing renders the empty label — half a coordinate locates nothing." },
						{ name: "format", type: '"decimal" | "dms"', default: '"decimal"', description: "Decimal is what an API round-trips and what a reader pastes into a map. DMS is still what marine, aviation and survey users read." },
						{ name: "precision", type: "number", default: "5", description: "Decimal places. Five is about a metre, three about a building." },
						{ name: "showHemisphere", type: "boolean", default: "false", description: "Adds N/S/E/W to the decimal form. Off by default because a signed pair is the portable form. DMS always shows them — an unsigned DMS value is ambiguous." },
						{ name: "strings", type: "Partial<CoordinatesStrings>", description: "The four hemisphere letters." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
