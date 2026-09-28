import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Address } from "themelia-ui/primitives"

import { DE, UK, US } from "./data"

export default function AddressExample() {
	return (
		// Captioned with the country code you pass; the name is the address's last line.
		<Grid columns={{ base: 1, md: 3 }}>
			{[["GB", UK], ["US", US], ["DE", DE]].map(([label, value]) => (
				<Stack key={label as string} gap="sm">
					<Text size="xs" type="secondary">country: "{label as string}"</Text>
					<Address value={value as typeof UK} />
				</Stack>
			))}
		</Grid>
	)
}
