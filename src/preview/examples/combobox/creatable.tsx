import { useMemo, useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AsyncCombobox } from "themelia-ui/features/combobox"

import { matching, type Country } from "./data"

export default function Creatable() {
	const [created, setCreated] = useState<string[]>([])
	const [createQuery, setCreateQuery] = useState("")
	const [createSelected, setCreateSelected] = useState<Country | null>(null)

	const createItems = useMemo(() => matching(createQuery), [createQuery])

	return (
		<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Country or a new one">
				<AsyncCombobox<Country>
					items={createItems}
					searchValue={createQuery}
					onSearchValueChange={setCreateQuery}
					selectedValue={createSelected}
					onSelectedValueChange={setCreateSelected}
					getItemLabel={(country) => country.name}
					getItemKey={(country) => country.code}
					creatable
					onCreate={(name) => {
						setCreated((prev) => [...prev, name])
						setCreateQuery("")
					}}
				/>
			</FormField>
			{created.length > 0 && (
				<Text size="sm" type="secondary">created: {created.join(", ")}</Text>
			)}
		</Stack>
	)
}
