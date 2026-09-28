import { useMemo, useState } from "react"

import {
	ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxEmpty, ComboboxItem, ComboboxList,
	ComboboxPopup, ComboboxPortal, ComboboxPositioner, ComboboxRoot, useComboboxFilter,
} from "themelia-ui/base/combobox"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"

import { COUNTRY_NAMES } from "./data"

/* Forwards `id` to the input, so `FormField`'s label reaches the control. */
function MultiCombobox({ id }: { id?: string }) {
	const [value, setValue] = useState<string[]>(["France", "Japan"])
	const [query, setQuery] = useState("")
	const filter = useComboboxFilter()
	const items = useMemo(
		() => COUNTRY_NAMES.filter((country) => filter.contains(country, query)),
		[filter, query],
	)

	return (
		<ComboboxRoot
			multiple
			value={value}
			onValueChange={setValue}
			inputValue={query}
			onInputValueChange={setQuery}
			items={items}
		>
			<ComboboxChips>
				{value.map((country) => (
					<ComboboxChip key={country}>{country}</ComboboxChip>
				))}
				<ComboboxChipsInput
					id={id}
					aria-label="Add countries"
					placeholder={value.length === 0 ? "Add countries…" : undefined}
				/>
			</ComboboxChips>
			<ComboboxPortal>
				<ComboboxPositioner>
					<ComboboxPopup>
						<ComboboxEmpty>Nothing left to add.</ComboboxEmpty>
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

export default function ComboboxMultiple() {
	return (
		<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Ships to" helperText="Type to filter, Backspace to remove the last chip.">
				<MultiCombobox />
			</FormField>
		</Stack>
	)
}
