import { Stack } from "themelia-ui/base/structure"
import { Address } from "themelia-ui/primitives"

import { DE, UK, US } from "./data"

export default function AddressInline() {
	return (
		<Stack gap="sm">
			<Address value={UK} format="inline" />
			<Address value={US} format="inline" />
			<Address value={DE} format="inline" />
		</Stack>
	)
}
