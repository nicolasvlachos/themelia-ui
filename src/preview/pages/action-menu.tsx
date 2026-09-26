import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ActionMenuPage() {
	return (
		<ComponentPage>
			<Example
				example="action-menu/action-menu"
				title="ActionMenu"
				description="Definition-driven rather than composed. Grouping, the destructive ordering, the checkbox rows, and the link handling are precisely the parts everyone gets subtly different when assembling menu items by hand."
			/>

			<Example
				example="action-menu/action-menu-order"
				title="Destructive last"
				description="A destructive entry moves to the end and gets a rule above it, whatever order it was declared in. Pass preserveOrder when the caller genuinely knows better."
			/>

			<Example id="action-menu-rule" title="One menu for every overflow">
				<Callout label="Rule">
					One <code>ActionMenu</code> for every overflow in the app — page headers, card
					headers, table rows. A surface-specific copy is how two menus in the same product
					end up ordering their delete differently.
				</Callout>
			</Example>

			<Example
				example="action-menu/action-menu-width"
				title="Width and row slots"
				description="A menu sizes to its widest row, capped at a reading measure rather than the viewport — so one long label cannot drag every row out with it. width pins it, maxWidth moves the cap, and width=“trigger” matches the trigger for a menu that reads as the field's own list."
			/>

			<Example
				example="action-menu/menus-in-context"
				title="In a card header"
				description="The card's actions prop takes the same definitions and renders them through the same menu."
			/>

			<Example
				example="action-menu/action-buttons"
				title="The same definitions, as buttons"
				description="ActionButtons lays the array out as visible buttons. max is where the two presentations meet: the first few render as buttons and the rest collapse into an ActionMenu built from the same array."
			/>

			<Example
				example="action-menu/context-actions"
				title="Actions that depend on a record"
				description="A ContextAction is an ActionDefinition whose handler and predicates take the record it acts on. resolveContextActions binds one set to one record — hidden entries dropped, disabled ones worked out, handlers bound — and placement pins an entry inline or sends it to the overflow menu whatever max says. Tables, kanban cards, activity entries and page headers all take this shape."
			/>

			<Example id="action-menu-api" title="API">
				<PropTable owners={["ActionMenu", "ActionButtons", "base/action-menu#ActionDefinition"]} />
				<PropTable owners={["ContextAction"]} />
			</Example>
		</ComponentPage>
	)
}
