import { useMemo, useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AsyncCombobox } from "themelia-ui/features/combobox"

import { matching, type Country } from "./data"

export default function AsyncComboboxExample() {
	const [query, setQuery] = useState("")
	const [selected, setSelected] = useState<Country | null>(null)

	const items = useMemo(() => matching(query), [query])

	return (
		<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Country">
				<AsyncCombobox<Country>
					items={items}
					searchValue={query}
					onSearchValueChange={setQuery}
					selectedValue={selected}
					onSelectedValueChange={setSelected}
					getItemLabel={(country) => country.name}
					getItemKey={(country) => country.code}
					getItemGroup={(country) => country.region}
					highlightMatch
				/>
			</FormField>
			<Text size="sm" type="secondary">
				{selected ? `${selected.name} — ${selected.capital}` : "nothing selected"}
			</Text>
		</Stack>
	)
}
