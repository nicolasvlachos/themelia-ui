import { useState } from "react"

import { Checkbox } from "themelia-ui/base/choice-inputs"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { ResourceCombobox } from "themelia-ui/features/combobox"

import { matching, searchCountries, wait, type Country } from "./data"

export default function ResourceComboboxExample() {
	const [failing, setFailing] = useState(true)

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Country (self-fetching)">
				<ResourceCombobox<Country>
					// No preload, so the error does not appear on mount.
					preload={false}
					fetcher={async ({ query: needle, signal }) => {
						await wait(500, signal)
						if (failing) throw new Error("The lookup service is unavailable.")
						return matching(needle).slice(0, 6)
					}}
					getKey={(country) => country.code}
					getLabel={(country) => country.name}
					getDescription={(country) => country.capital}
					getMeta={(country) => country.region}
				/>
			</FormField>
			<Checkbox label="Make the fetcher fail" checked={failing} onChange={(event) => setFailing(event.target.checked)} />

			<FormField label="Country (working)" helperText="No preload: it asks you to type first.">
				<ResourceCombobox<Country>
					preload={false}
					fetcher={searchCountries}
					getKey={(country) => country.code}
					getLabel={(country) => country.name}
					getDescription={(country) => country.capital}
					getMeta={(country) => country.region}
				/>
			</FormField>
		</Stack>
	)
}
