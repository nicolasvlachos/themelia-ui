import { useMemo, useState } from "react"

import {
	ComboboxEmpty, ComboboxInputTrigger, ComboboxItem, ComboboxList, ComboboxPopup,
	ComboboxPortal, ComboboxPositioner, ComboboxRoot, useComboboxFilter,
} from "themelia-ui/base/combobox"
import { FormField } from "themelia-ui/base/forms"
import { Input } from "themelia-ui/base/text-inputs"
import { Stack } from "themelia-ui/base/structure"

import { COUNTRY_NAMES } from "./data"

/* Forwards `id` to the input, so `FormField`'s label reaches the control. */
function SingleCombobox({ id }: { id?: string }) {
	const [value, setValue] = useState<string | null>(null)
	const [query, setQuery] = useState("")
	const filter = useComboboxFilter()
	const items = useMemo(
		() => COUNTRY_NAMES.filter((country) => filter.contains(country, query)),
		[filter, query],
	)

	return (
		<ComboboxRoot
			value={value}
			onValueChange={setValue}
			inputValue={query}
			onInputValueChange={setQuery}
			items={items}
		>
			{/* Named: a placeholder is not a label. */}
			<ComboboxInputTrigger
				id={id}
				aria-label="Search countries"
				placeholder="Search countries…"
				showClear={value != null}
			/>
			<ComboboxPortal>
				<ComboboxPositioner>
					<ComboboxPopup>
						<ComboboxEmpty>No country matches “{query}”.</ComboboxEmpty>
						<ComboboxList>
							{(country: string) => (
								<ComboboxItem key={country} value={country}>
									{country}
								</ComboboxItem>
							)}
						</ComboboxList>
					</ComboboxPopup>
				</ComboboxPositioner>
			</ComboboxPortal>
		</ComboboxRoot>
	)
}

export default function ComboboxField() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Plain input, for comparison">
				<Input placeholder="A regular text field" />
			</FormField>
			<FormField label="Combobox">
				<SingleCombobox />
			</FormField>
		</Stack>
	)
}
