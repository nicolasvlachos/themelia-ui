import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function RadioGroupPage() {
	return (
		<ComponentPage
			title="Radio groups"
			summary="One choice from a visible set, in four shapes: plain radios, cards for a choice the reader is weighing, a list for options whose second line is the decision, and pills for a compact switch. Every one is a radio group — one tab stop, arrows move between options."
			importPath="@/components/base/choice-inputs"
			exports={["RadioGroup", "Radio", "CardRadioGroup", "CardCheckboxGroup", "ListRadioGroup", "PillRadioGroup"]}
		>
			<Example
				example="radio-group/radio-group"
				title="Radio group"
				description="Arrows move between options and select as they go, which is the native radio behaviour — a group is one stop in the tab sequence, not one stop per option."
				stacked
			/>

			<Example
				example="radio-group/card-radio"
				title="Cards"
				description="Tiled single-select with an icon, a title, a sentence, and — where the sentence is not enough — an info affordance. The grid steps down on its own container's width, not the viewport's, because a card group is as likely to sit in a drawer as at page width."
				stacked
			/>

			<Example
				example="radio-group/card-checkbox"
				title="Cards, several at once"
				description="CardCheckboxGroup is the multi-select twin, sharing the card geometry so the two line up when a form uses both."
				stacked
			/>

			<Example
				example="radio-group/list-radio"
				title="List"
				description="The same options stacked instead of tiled — for more options than a card grid holds without becoming a wall, or where the second line carries the actual decision. CardRadioGroup and ListRadioGroup are one component laid out two ways."
				stacked
			/>

			<Example
				example="radio-group/pill-radio"
				title="Pills"
				description="A segmented control for two to five short options — a view switch, a period, a mode — where a Select is too heavy and cards are too tall. allowClear lets the active pill be clicked again to clear."
				stacked
			/>

			<Example id="radio-group-api" title="RadioGroup API">
				<PropTable owner="RadioGroup"
					rows={[
						{ name: "name", type: "string", description: "Groups the options. Required for a native radio group to behave as one." },
						{ name: "Radio checked / defaultChecked", type: "boolean", description: "Controlled and uncontrolled selection on each radio. The group supplies their shared name." },
						{ name: "Radio onChange", api: "Radio.onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Receives the native input event. Read event.target.value for the selected value." },
						{ name: "Radio label / value", type: "ReactNode / string", description: "One option. The label is part of the target." },
					]}
				/>
			</Example>

			<Example id="option-groups-api" title="Card, list and pill API">
				<PropTable owner="CardRadioGroup"
					rows={[
						{ name: "options", type: "ChoiceOption[]", description: "One shape for all three: value, label, description, icon, and an optional tooltip. A pill shows no description — it has no room for one." },
						{ name: "value / defaultValue / onValueChange", type: "string / (value) => void", description: "Controlled or uncontrolled selection." },
						{ name: "columns", type: "1 | 2 | 3 | 4", default: "3", description: "Cards only. The track floor, not a fixed count — the grid still steps down on its own container's width. Pick it from how much each card has to say." },
						{ name: "allowClear", api: "PillRadioGroup.allowClear", type: "boolean", default: "false", description: "Pills only. Lets the active pill be clicked again to clear the selection, for a filter whose empty state is \"all\"." },
						{ name: "fullWidth", api: "PillRadioGroup.fullWidth", type: "boolean", default: "false", description: "Pills only. Stretches the pills to fill the container, for a segmented control that owns its row." },
						{ name: "CardCheckboxGroup", type: "component", description: "The same cards for a multiple choice. Takes and returns an array of values." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
