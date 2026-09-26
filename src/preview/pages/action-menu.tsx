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
				<PropTable owner="ActionMenu"
					rows={[
						{ name: "actions", type: "ActionDefinition[]", description: "The commands. visible: false omits one entirely." },
						{ name: "ActionDefinition.group", type: "string | true", description: "Starts a group, ruling off above. A string also captions it; true rules off with no heading." },
						{ name: "ActionDefinition.tone", type: "ButtonTone", description: "destructive also moves the entry last and separates it." },
						{ name: "ActionDefinition.type", type: '"item" | "checkbox"', default: '"item"', description: "A checkbox row is driven by checked / onCheckedChange." },
						{ name: "ActionDefinition.href", type: "string", description: "Renders as a link. A native anchor unless renderLink is given." },
						{ name: "ActionDefinition.shortcut / description / trailing", api: ["ActionDefinition.shortcut", "ActionDefinition.description", "ActionDefinition.trailing"], type: "ReactNode", description: "Row slots. The label is the only part that gives way, so a long name truncates instead of pushing the shortcut off." },
						{ name: "renderLink", type: "(props) => ReactElement", description: "Routes href actions through the app's router. Return an element, not a spread function." },
						{ name: "renderTrigger", type: "Base UI render prop", description: "Replaces the trigger entirely, for a menu hanging off something that is not a button." },
						{ name: "width", type: 'string | number | "trigger"', description: 'Pins the surface width. "trigger" matches the trigger, for a menu that reads as the field\'s own list.' },
						{ name: "maxWidth", type: "string | number", default: "20rem", description: "Ceiling for the content-sized default — a reading measure, not the viewport." },
						{ name: "preserveOrder", type: "boolean", default: "false", description: "Keeps the declared order instead of moving destructive entries last." },
						{ name: "strings", type: "Partial<ActionMenuStrings>", description: "Overrides this menu's own copy — `trigger` names an icon-only trigger, which without a visible label has no other name." },
						{ name: "labelVisibility", type: '"always" | "sm-up"', description: "Hides the trigger's text below sm, leaving the glyph — for a toolbar that has to survive a phone." },
						{ name: "closeOnSelect", type: "boolean", default: "true", description: "Off for a menu of checkbox rows, where the reader is setting several things at once." },
						{ name: "side / align", type: '"top" | "right" | "bottom" | "left" / "start" | "center" | "end"', description: "Where the surface opens relative to the trigger." },
						{ name: "minWidth / contentClassName", type: "string | number / string", description: "A floor under the content-sized width, and the escape hatch for the surface itself." },
						{ name: "ActionButtons actions", api: "ActionButtons.actions", type: "ActionDefinition[]", description: "The same definitions ActionMenu takes — that is the point of the shape. tone and buttonStyle carry through to each button." },
						{ name: "ActionButtons max / strings", type: "number / Partial<ActionMenuStrings>", description: "How many render as buttons before the rest collapse into a menu built from the same array. `strings.overflow` names that menu." },
					]}
				/>
				<PropTable owner="ContextAction"
					rows={[
						{ name: "onClick", type: "(context: T) => void", description: "Receives the record the set was resolved against." },
						{ name: "visible", type: "boolean | (context: T) => boolean", default: "true", description: "False, or a predicate returning false, drops the entry for that record." },
						{ name: "disabled", type: "boolean | (context: T) => boolean", default: "false", description: "Worked out per record, so a locked row shows the action greyed rather than missing." },
						{ name: "placement", type: '"auto" | "inline" | "menu"', default: '"auto"', description: "inline stays a button whatever max is; menu always overflows; auto fills the buttons in order up to max." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
