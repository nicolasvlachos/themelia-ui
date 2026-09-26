import { Grid } from "themelia-ui/base/structure"
import { Address } from "themelia-ui/primitives"

export default function AddressPartial() {
	return (
		<Grid columns={{ base: 1, md: 3 }} gap="xl">
			<Address value={{ line1: "221B Baker Street", city: "London" }} />
			<Address value={{ city: "London", postalCode: "NW1 6XE" }} />
			<Address value={null} />
		</Grid>
	)
}
