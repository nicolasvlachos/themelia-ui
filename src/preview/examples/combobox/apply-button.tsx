import { useMemo, useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AsyncMultiCombobox } from "themelia-ui/features/combobox"

import { matching, type Country } from "./data"

export default function ApplyButton() {
	const [applyQuery, setApplyQuery] = useState("")
	const [applied, setApplied] = useState<Country[]>([])

	const applyItems = useMemo(() => matching(applyQuery), [applyQuery])

	return (
		<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Filter by country">
				<AsyncMultiCombobox<Country>
					items={applyItems}
					searchValue={applyQuery}
					onSearchValueChange={setApplyQuery}
					selectedValues={applied}
					onSelectedValuesChange={setApplied}
					getItemLabel={(country) => country.name}
					getItemKey={(country) => country.code}
					minSearchLength={0}
					applyButton
				/>
			</FormField>
			<Text size="sm" type="secondary">
				applied: {applied.length > 0 ? applied.map((c) => c.name).join(", ") : "none"}
			</Text>
		</Stack>
	)
}
