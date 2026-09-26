import { useState } from "react"
import { MapPinIcon } from "lucide-react"

import { SharedResourceCard } from "themelia-ui/features/resource-assignment"

import { VenueFacts, VenuePicker } from "./_shared"
import { VENUES, type Venue, type VenueHit } from "./data"

export default function Empty() {
	const [unassigned, setUnassigned] = useState<Venue | null>(null)

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
			resource={unassigned}
			alert={unassigned === null ? "This booking cannot be confirmed without a venue." : undefined}
			alertTone="warning"
			sections={[
				{
					id: "facts",
					Component: ({ context }) =>
						context.resource ? <VenueFacts venue={context.resource} /> : null,
				},
			]}
			selector={{
				title: "Choose a venue",
				confirmText: "Assign venue",
				cancelText: "Cancel",
				SelectorComponent: VenuePicker,
				mapInitialSelected: () => null,
				getSelectionLabel: (hit) => hit.label,
				// Refuses a room that cannot hold the party — the confirm stays disabled.
				isConfirmDisabled: (hit) => hit?.id === "v-2",
				onConfirmSelection: persist(setUnassigned),
			}}
		/>
	)
}
