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
				<PropTable owner="Address" />
				<PropTable symbols={["formatAddressLines"]} />
			</Example>

			<Example id="coordinates-api" title="Coordinates API">
				<PropTable owner="Coordinates" />
			</Example>
		</ComponentPage>
	)
}
