import { CardRadioGroup } from "themelia-ui/base/choice-inputs"
import { MetadataList } from "themelia-ui/base/display"
import type { SharedResourceSelectorProps } from "themelia-ui/features/resource-assignment"

import { HITS, type Venue, type VenueHit } from "./data"

/** The consumer's picker. The card knows nothing about it beyond this prop shape. */
export function VenuePicker({ selected, onSelect }: SharedResourceSelectorProps<VenueHit>) {
	return (
		<CardRadioGroup
			columns={1}
			value={selected?.id ?? ""}
			onValueChange={(id) => onSelect(HITS.find((hit) => hit.id === id) ?? null)}
			options={HITS.map((hit) => ({
				value: hit.id,
				label: hit.label,
				description: hit.description,
			}))}
		/>
	)
}

export function VenueFacts({ venue }: { venue: Venue }) {
	return (
		<MetadataList
			columns={2}
			items={[
				{ id: "address", label: "Address", value: venue.address },
				/* Not `mono`: "180 seated" is prose, not an identifier. */
				{ id: "capacity", label: "Capacity", value: `${venue.capacity} seated` },
				{ id: "contact", label: "Contact", value: { kind: "email", value: venue.contact } },
			]}
		/>
	)
}
