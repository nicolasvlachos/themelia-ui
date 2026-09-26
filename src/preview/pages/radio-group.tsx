import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function RadioGroupPage() {
	return (
		<ComponentPage>
			<Example
				example="radio-group/radio-group"
				title="Radio group"
				description="Arrows move between options and select as they go, which is the native radio behaviour — a group is one stop in the tab sequence, not one stop per option."
			/>

			<Example
				example="radio-group/card-radio"
				title="Cards"
				description="Tiled single-select with an icon, a title, a sentence, and — where the sentence is not enough — an info affordance. The grid steps down on its own container's width, not the viewport's, because a card group is as likely to sit in a drawer as at page width."
			/>

			<Example
				example="radio-group/card-checkbox"
				title="Cards, several at once"
				description="CardCheckboxGroup is the multi-select twin, sharing the card geometry so the two line up when a form uses both."
			/>

			<Example
				example="radio-group/list-radio"
				title="List"
				description="The same options stacked instead of tiled — for more options than a card grid holds without becoming a wall, or where the second line carries the actual decision. CardRadioGroup and ListRadioGroup are one component laid out two ways."
			/>

			<Example
				example="radio-group/pill-radio"
				title="Pills"
				description="A segmented control for two to five short options — a view switch, a period, a mode — where a Select is too heavy and cards are too tall. allowClear lets the active pill be clicked again to clear."
			/>

			<Example id="radio-group-api" title="RadioGroup API">
				<PropTable owners={["RadioGroup", "Radio"]} />
			</Example>

			<Example id="option-groups-api" title="Card, list and pill API">
				<PropTable owners={["CardRadioGroup", "ListRadioGroup", "PillRadioGroup"]} />
				<PropTable symbols={["CardCheckboxGroup"]} />
			</Example>
		</ComponentPage>
	)
}
