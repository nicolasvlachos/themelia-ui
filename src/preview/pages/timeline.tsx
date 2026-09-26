import {
	CheckIcon, CircleDotIcon, CreditCardIcon, PackageIcon, TruckIcon, UndoIcon,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/base/badge"
import { Stack } from "@/components/base/structure"
import { Stepper, Timeline, type StepperStep, type TimelineItem } from "@/components/base/timeline"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const ORDER: TimelineItem[] = [
	{
		id: "placed",
		title: "Order placed",
		description: "Eight items, paid in full.",
		timestamp: "14 Aug, 09:12",
		icon: CheckIcon,
		status: "completed",
	},
	{
		id: "paid",
		title: "Payment captured",
		description: "Visa ending 4417.",
		timestamp: "14 Aug, 09:12",
		icon: CreditCardIcon,
		status: "completed",
	},
	{
		id: "packed",
		title: "Packed",
		timestamp: "15 Aug, 11:40",
		icon: PackageIcon,
		status: "completed",
	},
	{
		id: "transit",
		title: "In transit",
		description: "Left the Rotterdam depot.",
		timestamp: "16 Aug, 06:02",
		icon: TruckIcon,
		status: "current",
	},
	{
		id: "delivered",
		title: "Delivered",
		timestamp: "Expected 18 Aug",
		status: "pending",
	},
]

const STATUSES: TimelineItem[] = [
	{ id: "completed", title: "completed", description: "It happened, and it went as intended.", status: "completed" },
	{ id: "current", title: "current", description: "Where the thing is right now.", icon: CircleDotIcon, status: "current" },
	{ id: "warning", title: "warning", description: "It happened, but it needs a look.", status: "warning" },
	{ id: "destructive", title: "destructive", description: "It failed. Never \"error\" — the kit has one word for this.", status: "destructive" },
	{ id: "pending", title: "pending", description: "It has not happened yet, so the dot is unfilled.", status: "pending" },
	{ id: "neutral", title: "neutral", description: "It happened and carries no judgement. The default.", status: "neutral" },
]

const WITH_CONTENT: TimelineItem[] = [
	{
		id: "refund",
		title: "Refund issued",
		timestamp: "17 Aug, 14:20",
		icon: UndoIcon,
		status: "warning",
		children: (
			<Stack direction="horizontal" gap="sm">
				<Badge tone="warning">Partial</Badge>
				<Badge tone="neutral">€ 42.00</Badge>
			</Stack>
		),
	},
	{
		id: "note",
		title: "Note added",
		timestamp: "17 Aug, 14:26",
		status: "neutral",
		// A sentence is a description; `children` is for blocks, and pays a block's gap.
		description: "Customer reported one damaged item on arrival.",
	},
]

const WIZARD: StepperStep[] = [
	{ id: "account", label: "Account", hint: "Who you are", status: "completed" },
	{ id: "billing", label: "Billing", hint: "How you pay", status: "completed" },
	{ id: "shipping", label: "Shipping", hint: "Where it goes", status: "current" },
	{ id: "review", label: "Review", hint: "Check and place", status: "upcoming" },
]

/* The caller owns the position; a press on a finished step makes it current again. */
function PressableTrail() {
	const [current, setCurrent] = useState(2)
	const steps = WIZARD.map((step, index) => ({
		...step,
		status: index < current ? ("completed" as const) : index === current ? ("current" as const) : ("upcoming" as const),
	}))
	return <Stepper variant="trail" steps={steps} onStepClick={(_, index) => setCurrent(index)} />
}

export function TimelinePage() {
	return (
		<ComponentPage
			title="Timeline"
			summary="An ordered run of events on one rail. The shared geometry under every dated list in the kit — a changelog, a set of milestones, an order's progress — so the dot, the connector and the title block are decided once rather than redrawn per caller."
			importPath="@/components/base/timeline"
			exports={["Timeline", "Stepper"]}
		>
			<Example
				id="timeline-default"
				title="An order's progress"
				description="Each entry carries a status, and the connector below it takes the same tone — so a run of completed steps reads as one finished stretch rather than as separate dots on a neutral thread."
				stacked
				code={`<Timeline
  items={[
    { id: "placed", title: "Order placed", timestamp: "14 Aug, 09:12", icon: CheckIcon, status: "completed" },
    { id: "transit", title: "In transit", timestamp: "16 Aug, 06:02", icon: TruckIcon, status: "current" },
    { id: "delivered", title: "Delivered", timestamp: "Expected 18 Aug", status: "pending" },
  ]}
/>`}
			>
				<Timeline items={ORDER} />
			</Example>

			<Example
				id="timeline-statuses"
				title="Statuses"
				description="Progress states first, then outcomes. `pending` is the only one that describes an absence, which is why it is the only unfilled dot."
				stacked
				code={`<Timeline items={[{ id: "1", title: "Packed", status: "completed" }]} />`}
			>
				<Timeline items={STATUSES} />
			</Example>

			<Example
				id="timeline-content"
				title="Entries that carry more than a line"
				description="`children` hangs anything under the description — a badge row, a diff, an action. The rail keeps its geometry regardless of how tall an entry grows, because the connector fills the space rather than being offset into it."
				stacked
				code={`<Timeline
  items={[
    {
      id: "refund",
      title: "Refund issued",
      status: "warning",
      children: <Badge tone="warning">Partial</Badge>,
    },
  ]}
/>`}
			>
				<Timeline items={WITH_CONTENT} />
			</Example>

			<Example
				id="timeline-props"
				title="Props"
				description="One prop. Everything an entry needs travels in the item, so a caller composing a timeline from its own records maps once rather than threading props through."
			>
				<Callout>
					The rail is <code>aria-hidden</code>. Its tone repeats what the entry already says in
					words and the icon is chosen for recognition rather than meaning, so announcing it
					would put noise between every two entries. Anything a reader must know belongs in
					the title or the description.
				</Callout>
				<PropTable owner="Timeline"
					rows={[
						{ name: "items", type: "TimelineItem[]", required: true, description: "The entries, in the order they should be read. Rendered as an <ol>, because these have an order and a screen reader should say so." },
						{ name: "item.id", api: "TimelineItem.id", type: "string", required: true, description: "Stable identity for the row." },
						{ name: "item.title", api: "TimelineItem.title", type: "ReactNode", required: true, description: "What happened." },
						{ name: "item.description", api: "TimelineItem.description", type: "ReactNode", description: "Supporting copy under the title." },
						{ name: "item.timestamp", api: "TimelineItem.timestamp", type: "ReactNode", description: "Already formatted — the kit's date primitives decide the format, not this component." },
						{ name: "item.trailing", api: "TimelineItem.trailing", type: "ReactNode", description: "The trailing lane of the title row when what belongs there is not a time — an amount, a count. Replaces the timestamp rather than joining it; there is one lane." },
						{ name: "item.icon", api: "TimelineItem.icon", type: "LucideIcon", description: "Decorative glyph inside the dot." },
						{ name: "item.status", api: "TimelineItem.status", type: '"progress" | "completed" | "current" | "pending" | "success" | "warning" | "destructive" | "neutral"', default: '"neutral"', description: "Colours the dot, and the connector that runs from it to the next entry. progress and completed are not the same thing: a step you walked past is a POSITION, so it takes the same primary tone as the step you are on and a sequence reads as one journey in one colour; completed is an OUTCOME, a milestone that landed. A bare progress dot is hollow where current is solid, because on a rail with no glyphs the card still has to say where the thing IS." },
						{ name: "item.children", api: "TimelineItem.children", type: "ReactNode", description: "Anything the entry carries below its description." },
					]}
				/>
			</Example>
			<Example
				id="stepper-default"
				title="Stepper"
				description="A numbered sequence the reader is partway through: a numeral that becomes a tick, a connector to the next step, a label and an optional hint. StepsBar and BreadcrumbProgress both draw with it, so the markers, the connectors and the state rules are decided once. `bar` sets the label under a ringed marker in an equal column; `trail` sets it beside a filled marker and folds it away below lg."
				stacked
				bleed
				code={`<Stepper
  steps={[
    { id: "account", label: "Account", hint: "Who you are", status: "completed" },
    { id: "shipping", label: "Shipping", status: "current" },
    { id: "review", label: "Review", status: "upcoming" },
  ]}
/>

<Stepper variant="trail" steps={steps} />`}
			>
				<Stack gap="2xl">
					<Stepper steps={WIZARD} />
					<Stepper variant="trail" steps={WIZARD} />
				</Stack>
			</Example>

			<Example
				id="stepper-pressable"
				title="Going back a step"
				description="`onStepClick` turns each step into a button. Finished steps and the current one are reachable; upcoming ones are disabled, because a wizard that lets you skip ahead past a step you have not filled in is not a wizard. The caller owns the position — the stepper only reports the press."
				stacked
				code={`<Stepper
  variant="trail"
  steps={steps}
  onStepClick={(id, index) => setCurrent(index)}
/>`}
			>
				<PressableTrail />
			</Example>

			<Example
				id="stepper-props"
				title="Stepper props"
				description="Position and state are said in words as well as drawn: each step announces what its numeral counts, and a finished or current step says so, so neither the tick nor the tone is the only signal."
			>
				<Callout>
					The current step carries <code>aria-current="step"</code> — on its button when steps are
					pressable, because that is where focus lands, and on the list item otherwise. The
					marker and the connectors are <code>aria-hidden</code>.
				</Callout>
				<PropTable owner="Stepper"
					rows={[
						{ name: "steps", type: "StepperStep[]", required: true, description: "The steps, in order. Rendered as an <ol>, because the order is the meaning." },
						{ name: "step.id", api: "StepperStep.id", type: "string", required: true, description: "Stable identity for the step, handed back to onStepClick." },
						{ name: "step.label", api: "StepperStep.label", type: "ReactNode", required: true, description: "What the step is called." },
						{ name: "step.hint", api: "StepperStep.hint", type: "ReactNode", description: "A second, quieter line under the label." },
						{ name: "step.status", api: "StepperStep.status", type: '"completed" | "complete" | "current" | "upcoming"', default: '"upcoming"', description: "Where the step stands. completed is the canonical spelling; complete is accepted as the same state and normalised, so the DOM only ever says completed." },
						{ name: "step.accessibleName", api: "StepperStep.accessibleName", type: "string", description: "The step's whole accessible name, worded by the caller. Replaces the position, label, hint and state text rather than joining them; aria-current still marks the current step." },
						{ name: "variant", type: '"bar" | "trail"', default: '"bar"', description: "bar: labels under ringed markers in equal columns, with the connector through the marker row. trail: labels beside filled markers, a rule taking the rest of the row, labels visually hidden below lg." },
						{ name: "onStepClick", type: "(id: string, index: number) => void", description: "Makes each step a button. Completed and current steps are reachable, upcoming ones disabled. Without it the steps are plain list items." },
						{ name: "strings", type: "Partial<StepperStrings>", description: "position(index, total) names what the numeral counts; completed and current are said with those steps." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
