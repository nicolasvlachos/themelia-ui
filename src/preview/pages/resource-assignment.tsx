import { useState } from "react"
import { MapPinIcon } from "lucide-react"

import { CardRadioGroup } from "@/components/base/choice-inputs"
import { MetadataList } from "@/components/base/display"
import { Alert } from "@/components/base/feedback"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	SharedResourceCard,
	type SharedResourceSelectorProps,
} from "@/components/features"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

/** What the record stores. */
interface Venue {
	id: string
	name: string
	address: string
	capacity: number
	contact: string
}

/** What the picker offers — lighter, and a different shape on purpose. */
interface VenueHit {
	id: string
	label: string
	description: string
}

const VENUES: Record<string, Venue> = {
	"v-1": {
		id: "v-1",
		name: "Marlow Hall",
		address: "14 Bridge Street, Marlow",
		capacity: 180,
		contact: "bookings@marlowhall.example",
	},
	"v-2": {
		id: "v-2",
		name: "The Old Granary",
		address: "2 Mill Lane, Hexton",
		capacity: 60,
		contact: "hello@oldgranary.example",
	},
	"v-3": {
		id: "v-3",
		name: "Riverside Rooms",
		address: "8 Quay Road, Sattersby",
		capacity: 240,
		contact: "events@riverside.example",
	},
}

const HITS: VenueHit[] = [
	{ id: "v-1", label: "Marlow Hall", description: "180 seated · main hall + bar" },
	{ id: "v-2", label: "The Old Granary", description: "60 seated · one room, no kitchen" },
	{ id: "v-3", label: "Riverside Rooms", description: "240 seated · three rooms" },
]

/** The consumer's picker. The card knows nothing about it beyond this prop shape. */
function VenuePicker({ selected, onSelect }: SharedResourceSelectorProps<VenueHit>) {
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

function VenueFacts({ venue }: { venue: Venue }) {
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

function RecoverableAssignmentExample() {
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

export function ResourceAssignmentPage() {
	const [assigned, setAssigned] = useState<Venue | null>(VENUES["v-1"] ?? null)
	const [unassigned, setUnassigned] = useState<Venue | null>(null)

	/** A deliberate delay, so the confirming state is visible rather than theoretical. */
	const persist = (set: (venue: Venue | null) => void) => async (hit: VenueHit) => {
		await new Promise((resolve) => setTimeout(resolve, 700))
		set(VENUES[hit.id] ?? null)
	}

	return (
		<ComponentPage
			title="Resource assignment"
			summary="The “this record has a venue assigned; here it is, and here is how to change it” panel. The card owns the shape — a panel, a dialog, a pending choice, and a confirm that waits for the write. The picker inside the dialog is yours, because every assignment is a different search."
			importPath="@/components/features/resource-assignment"
			exports={["SharedResourceCard", "useSharedResourceCard",
				"DefaultDialogContent", "DefaultDialogSummary",
			]}
		>
			<Example
				id="assigned"
				title="With a resource"
				description="Press Change: the dialog opens on what is currently assigned, the summary restates the pending choice above the buttons, and confirming waits for the write before it closes. The body here comes from sections — data, which is what a screen assembling its panel from a config actually has."
				stacked
				code={`<SharedResourceCard<Venue, VenueHit>
  icon={<MapPinIcon />}
  title="Venue"
  resource={venue}
  sections={[{ id: "facts", Component: ({ context }) => <VenueFacts venue={context.resource!} /> }]}
  viewLink={{ href: \`/venues/\${venue.id}\`, label: "Open venue" }}
  selector={{
    title: "Choose a venue",
    confirmText: "Assign venue",
    cancelText: "Cancel",
    SelectorComponent: VenuePicker,
    mapInitialSelected: (venue) =>
      venue ? { id: venue.id, label: venue.name, description: "" } : null,
    getSelectionLabel: (hit) => hit.label,
    onConfirmSelection: async (hit) => { await api.assign(hit.id) },
  }}
/>`}
			>
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
			</Example>

			<Example
				id="empty"
				title="With none"
				description="`resource === null` is the only empty state — the card never tracks “assigned” separately from the thing itself. Without a picker the empty state says so plainly and offers nothing; with one it offers the assign action, and the label switches from Change to Assign on its own."
				stacked
				code={`<SharedResourceCard resource={null} selector={…} />
// no selector — the empty state does not pretend there is something to do
<SharedResourceCard resource={null} />`}
			>
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
			</Example>

			<Example
				id="retry"
				title="Rejected write and retry"
				description="The first confirmation rejects. The dialog stays open, the selected venue remains visible, and the same confirmation can be retried successfully. The error is surfaced through onError in the card's existing alert seam."
				stacked
			>
				<RecoverableAssignmentExample />
			</Example>

			<Example id="assignment-rules" title="Two types, and where the choice comes from" stacked>
				<Callout label="Rule">
					<code>TResource</code> is what is <strong>persisted</strong>; <code>TSuggestion</code> is
					what the picker offers. They are separate because the round trip is: pick a suggestion,
					confirm it, and the server answers with a resource. Collapsing them would force every
					consumer to make their search results look like their stored records.
				</Callout>
				<Text size="sm" type="secondary">
					On each open the pending choice comes from one of three places, in order: a controlled{" "}
					<code>value</code>, then — on the <strong>first</strong> open only — an explicit{" "}
					<code>defaultValue</code>, then <code>mapInitialSelected(resource)</code>. Without the
					first-open restriction a default would override the assignment every time the dialog
					reopened, and “Change” would keep forgetting what the record actually holds.
				</Text>
				<Text size="sm" type="secondary">
					Closing is refused while the write is in flight, and a rejected write leaves the dialog
					open with the choice intact — the reader has to be able to see what failed and try again.
				</Text>
			</Example>

			<Example id="assignment-api" title="API">
				<PropTable owner="SharedResourceCard"
					rows={[
						{ name: "resource", type: "TResource | null", required: true, description: "The persisted assignment. null is the only empty state; hasResource is derived from it and never independently controlled." },
						{ name: "selector", type: "SelectorConfig", description: "The picker, its copy, and the write. Omit it and the card is read-only — no change action, and an empty state that offers nothing." },
						{ name: "selector.SelectorComponent", type: "ComponentType<SelectorProps>", required: true, description: "Yours. It receives selected, onSelect, and inModal — a picker that adapts inside a dialog can read the last one." },
						{ name: "selector.mapInitialSelected", type: "(resource) => TSuggestion | null", required: true, description: "Turns the persisted resource into a starting choice, so “Change” opens on what the record holds." },
						{ name: "selector.onConfirmSelection", type: "(selection) => void | Promise", required: true, description: "Persists it. A returned promise is awaited and drives the confirming state; a rejection keeps the dialog open and reaches onError." },
						{ name: "selector.isConfirmDisabled", type: "(selection) => boolean", description: "Refuses a pending choice — an inactive venue, a room too small. The confirm stays disabled rather than failing after the press." },
						{ name: "selector.getSelectionLabel", type: "(selection) => ReactNode", description: "How the choice reads in the summary above the buttons. Without it the card looks for a string `label` field, which is a guess — a cheap and usually right one." },
						{ name: "renderResourceContent / ResourceContentComponent / sections", type: "ladder", description: "The assigned body, most specific first. A render prop closes over local state, a component is reusable, and sections are data — each rung exists because the one below it is wrong for someone." },
						{ name: "actions", type: "ActionDefinition[]", description: "Extra overflow actions. Alone, the change action is a header button; alongside these it joins them — two triggers side by side is worse than one menu holding both." },
						{ name: "viewAction / viewLink", type: "ReactNode / { href, label }", description: "The router-neutral slot and the native-anchor convenience. Both render only when a resource is assigned." },
						{ name: "useSharedResourceCard", type: "hook", description: "The state machine without the card: open state, pending choice, canConfirmSelection, and a confirm that awaits." },
						{ name: "DefaultDialogContent", type: "component", description: "The picker the assignment dialog shows when a consumer supplies none. Exported so a custom dialog can keep it and add to it, rather than starting from nothing." },
						{ name: "DefaultDialogSummary", type: "component", description: "What is about to be committed, restated above the confirm. A picker can scroll, and the chosen row is often out of sight by the time the reader reaches the button." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
