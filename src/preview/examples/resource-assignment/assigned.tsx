import { useState } from "react"
import { MapPinIcon } from "lucide-react"

import { SharedResourceCard } from "themelia-ui/features/resource-assignment"

import { VenueFacts, VenuePicker } from "./_shared"
import { HITS, VENUES, type Venue, type VenueHit } from "./data"

export default function Assigned() {
	const [assigned, setAssigned] = useState<Venue | null>(VENUES["v-1"] ?? null)

	/** A deliberate delay, so the confirming state is visible rather than theoretical. */
	const persist = (set: (venue: Venue | null) => void) => async (hit: VenueHit) => {
		await new Promise((resolve) => setTimeout(resolve, 700))
		set(VENUES[hit.id] ?? null)
	}

	return (
		<SharedResourceCard<Venue, VenueHit>
			icon={<MapPinIcon />}
			title="Venue"
			description="Where this booking takes place."
			resource={assigned}
			footerText="Changing the venue notifies everyone already invited."
			viewLink={assigned ? { href: `#/venues/${assigned.id}`, label: "Open venue" } : undefined}
			sections={[
				{
					id: "facts",
					Component: ({ context }) =>
						context.resource ? <VenueFacts venue={context.resource} /> : null,
				},
			]}
			selector={{
				title: "Choose a venue",
				description: "Three rooms are free on the booking's date.",
				confirmText: "Assign venue",
				cancelText: "Cancel",
				SelectorComponent: VenuePicker,
				mapInitialSelected: (venue) =>
					venue ? (HITS.find((hit) => hit.id === venue.id) ?? null) : null,
				getSelectionLabel: (hit) => hit.label,
				onConfirmSelection: persist(setAssigned),
			}}
		/>
	)
}
