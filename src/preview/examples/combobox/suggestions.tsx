import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { SuggestionsCombobox } from "themelia-ui/features/combobox"

import { matching, wait, type Country } from "./data"

export default function Suggestions() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Search">
				<SuggestionsCombobox<Country>
					fetchData={async (needle, context) => {
						if (needle) await wait(400, context?.signal)
						return matching(needle).slice(0, 5)
					}}
					itemKey={(country) => country.code}
					itemText={(country) => country.name}
					preload
				/>
			</FormField>
		</Stack>
	)
}
