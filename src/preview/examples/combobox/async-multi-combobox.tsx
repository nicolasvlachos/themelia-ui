import { useMemo, useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AsyncMultiCombobox } from "themelia-ui/features/combobox"

import { matching, type Country } from "./data"

export default function AsyncMultiComboboxExample() {
	const [multiQuery, setMultiQuery] = useState("")
	const [multiSelected, setMultiSelected] = useState<Country[]>([])

	const multiItems = useMemo(() => matching(multiQuery), [multiQuery])

	return (
		<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Countries">
				<AsyncMultiCombobox<Country>
					items={multiItems}
					searchValue={multiQuery}
					onSearchValueChange={setMultiQuery}
					selectedValues={multiSelected}
					onSelectedValuesChange={setMultiSelected}
					getItemLabel={(country) => country.name}
					getItemKey={(country) => country.code}
					minSearchLength={0}
					highlightMatch
				/>
			</FormField>
			<Text size="sm" type="secondary">
				{multiSelected.length} selected
			</Text>
		</Stack>
	)
}
