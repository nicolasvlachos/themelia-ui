import { Address, Coordinates } from "@/components/primitives"
import { Grid, Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

const UK = { line1: "221B Baker Street", city: "London", postalCode: "NW1 6XE", country: "GB" }
const US = { line1: "1600 Amphitheatre Parkway", city: "Mountain View", region: "CA", postalCode: "94043", country: "US" }
const DE = { line1: "Unter den Linden 77", city: "Berlin", postalCode: "10117", country: "DE" }

export function PrimitiveAddressPage() {
	return (
		<ComponentPage
			title="Places: address & coordinates"
			summary="A location, in the two forms a product stores one: a postal address and a latitude–longitude pair. Each is shaped by the place rather than the reader — an address takes its country’s line order, not the reader’s language, and a coordinate keeps only the decimals that still mean a distance."
			importPath="@/components/primitives"
			exports={["Address", "formatAddress", "formatAddressLines", "Coordinates"]}
		>
			<Example
				id="address"
				title="Ordered by country"
				description="Germany puts the postcode before the city, Britain puts it last and alone, the United States runs city, state and ZIP together on one line. There is no Intl for this, so the kit ships three orderings keyed by country and takes an explicit order for anything else — rather than pretending to know every country and being wrong quietly, in someone else's."
				stacked
				code={`<Address value={{ line1, city, postalCode, country: "GB" }} />`}
			>
				{/* Captioned with the country code you pass; the name is the address's last line. */}
				<Grid columns={{ base: 1, md: 3 }} gap="xl">
					{[["GB", UK], ["US", US], ["DE", DE]].map(([label, value]) => (
						<Stack key={label as string} gap="2xs">
							<Text size="xs" type="secondary">country: "{label as string}"</Text>
							<Address value={value as typeof UK} />
						</Stack>
					))}
				</Grid>
			</Example>

			<Example
				id="address-inline"
				title="Inline, for a cell"
				description="The same ordering on one line. Both forms come from one function, so a city that moves line in the block form moves position here too and the two cannot disagree."
				stacked
				code={`<Address value={value} format="inline" />`}
			>
				<Stack gap="xs">
					<Address value={UK} format="inline" />
					<Address value={US} format="inline" />
					<Address value={DE} format="inline" />
				</Stack>
			</Example>

			<Example
				id="address-partial"
				title="Missing fields"
				description="An empty field drops out, and a line left with nothing drops with it — so a missing line2 never leaves a blank row in the middle of an address."
				stacked
				code={`<Address value={{ line1: "221B Baker Street", city: "London" }} />`}
			>
				<Grid columns={{ base: 1, md: 3 }} gap="xl">
					<Address value={{ line1: "221B Baker Street", city: "London" }} />
					<Address value={{ city: "London", postalCode: "NW1 6XE" }} />
					<Address value={null} />
				</Grid>
			</Example>

			<Example
				id="coordinates"
				title="Coordinates"
				description="A decimal degree is about 111km, so the decimals carry all the meaning. Five is the default because that is where the number stops being a neighbourhood and starts being a place — and because storing more than five and showing all of it is how 48.858370000000004 ends up on a page."
				stacked
				code={`<Coordinates latitude={48.85837} longitude={2.29448} />
<Coordinates latitude={48.85837} longitude={2.29448} format="dms" />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `decimal`, value: <Coordinates latitude={48.85837} longitude={2.29448} /> },
						{ code: `showHemisphere`, value: <Coordinates latitude={48.85837} longitude={2.29448} showHemisphere /> },
						{ code: `format="dms"`, value: <Coordinates latitude={48.85837} longitude={2.29448} format="dms" /> },
						{ code: `southern / western`, value: <Coordinates latitude={-33.8688} longitude={151.2093} format="dms" /> },
						{ code: `precision={3}`, value: <Coordinates latitude={48.85837} longitude={2.29448} precision={3} /> },
						{ code: `precision={0}`, value: <Coordinates latitude={48.85837} longitude={2.29448} precision={0} /> },
						{ code: `null`, value: <Coordinates latitude={null} longitude={null} /> },
					]}
				/>
			</Example>

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
