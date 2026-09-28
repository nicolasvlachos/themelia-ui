import { useState } from "react"

import {
	ComboboxEmpty, ComboboxGroup, ComboboxGroupLabel, ComboboxItem, ComboboxList, ComboboxPopup,
	ComboboxPopupInput, ComboboxPortal, ComboboxPositioner, ComboboxRoot, ComboboxTrigger,
	ComboboxValue,
} from "themelia-ui/base/combobox"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"

import { COUNTRY_NAMES } from "./data"

const REGIONS: Record<string, string[]> = {
	Europe: ["Austria", "Belgium", "Denmark", "France", "Germany", "Spain", "Sweden"],
	Americas: ["Argentina", "Brazil", "Canada", "Chile", "Mexico"],
	"Asia Pacific": ["Australia", "Japan", "New Zealand"],
}

/* Forwards `id` to the trigger, so `FormField`'s label names it (a combobox is not named by its value). */
function SelectLikeCombobox({ id }: { id?: string }) {
	const [value, setValue] = useState<string | null>(null)

	return (
		<ComboboxRoot value={value} onValueChange={setValue} items={COUNTRY_NAMES.slice(0, 8)}>
			<ComboboxTrigger id={id}>
				<ComboboxValue placeholder="Choose a country" />
			</ComboboxTrigger>
			<ComboboxPortal>
				<ComboboxPositioner>
					<ComboboxPopup>
						<ComboboxPopupInput placeholder="Search countries" aria-label="Search countries" />
						<ComboboxEmpty>No country matches.</ComboboxEmpty>
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

/* Forwards `id` to the trigger, so `FormField`'s label names it (a combobox is not named by its value). */
function GroupedCombobox({ id }: { id?: string }) {
	const [value, setValue] = useState<string | null>(null)

	return (
		<ComboboxRoot value={value} onValueChange={setValue}>
			<ComboboxTrigger id={id}>
				<ComboboxValue placeholder="Choose a country" />
			</ComboboxTrigger>
			<ComboboxPortal>
				<ComboboxPositioner>
					<ComboboxPopup>
						<ComboboxPopupInput placeholder="Search countries" aria-label="Search countries" />
						<ComboboxEmpty>No country matches.</ComboboxEmpty>
						<ComboboxList>
							{Object.entries(REGIONS).map(([region, countries]) => (
								<ComboboxGroup key={region}>
									<ComboboxGroupLabel>{region}</ComboboxGroupLabel>
									{countries.map((country) => (
										<ComboboxItem key={country} value={country}>
											{country}
										</ComboboxItem>
									))}
								</ComboboxGroup>
							))}
						</ComboboxList>
					</ComboboxPopup>
				</ComboboxPositioner>
			</ComboboxPortal>
		</ComboboxRoot>
	)
}

export default function ComboboxSelect() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Country from the list">
				<SelectLikeCombobox />
			</FormField>
			<FormField label="Grouped" helperText="Groups get a caption and their own scroll block.">
				<GroupedCombobox />
			</FormField>
		</Stack>
	)
}
