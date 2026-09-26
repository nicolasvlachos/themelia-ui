import { useState } from "react"
import { MapPinIcon } from "lucide-react"

import { Alert } from "themelia-ui/base/feedback"
import { Stack } from "themelia-ui/base/structure"
import { SharedResourceCard, type SharedResourceSelectorProps } from "themelia-ui/features/resource-assignment"

import { VenueFacts, VenuePicker } from "./_shared"
import { HITS, VENUES, type Venue, type VenueHit } from "./data"

function RecoverableVenuePicker({
	selected,
	onSelect,
	error,
}: SharedResourceSelectorProps<VenueHit, { error: string | null }>) {
	return (
		<Stack gap="md">
			{!!error && <Alert tone="destructive">{error}</Alert>}
			<VenuePicker selected={selected} onSelect={onSelect} inModal />
		</Stack>
	)
}

export default function Retry() {
	const [resource, setResource] = useState<Venue | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [failNext, setFailNext] = useState(true)

	return (
		<SharedResourceCard<Venue, VenueHit, { error: string | null }>
			icon={<MapPinIcon />}
			title="Venue with retry"
			description="The first write fails; the pending venue stays selected for retry."
			resource={resource}
			alert={error}
			alertTone="destructive"
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
				SelectorComponent: RecoverableVenuePicker,
				selectorProps: { error },
				mapInitialSelected: (venue) =>
					venue ? (HITS.find((hit) => hit.id === venue.id) ?? null) : null,
				getSelectionLabel: (hit) => hit.label,
				onConfirmSelection: async (hit) => {
					await new Promise((resolve) => setTimeout(resolve, 500))
					if (failNext) {
						setFailNext(false)
						throw new Error("The assignment service is temporarily unavailable.")
					}
					setError(null)
					setResource(VENUES[hit.id] ?? null)
				},
				onError: (cause) => {
					setError(cause instanceof Error ? cause.message : "Could not assign the venue.")
				},
			}}
		/>
	)
}
