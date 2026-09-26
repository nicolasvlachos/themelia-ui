import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { ResourceCombobox } from "themelia-ui/features/combobox"

import { searchCountries, type Country } from "./data"

export default function ComboboxPicker() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Destination" helperText="Open it to browse, or type to search.">
				<ResourceCombobox<Country>
					fetcher={searchCountries}
					getKey={(country) => country.code}
					getLabel={(country) => country.name}
					getDescription={(country) => country.capital}
					getMeta={(country) => country.region}
					highlightMatch
				/>
			</FormField>
		</Stack>
	)
}
