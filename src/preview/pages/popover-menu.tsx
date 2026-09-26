import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PopoverMenuPage() {
	return (
		<ComponentPage>
			<Example
				example="popover-menu/popover-menu"
				title="PopoverMenu"
				description="Trigger, optional header, search, list, optional footer. The picker shape behind filter facets, operator selects, and assignee menus. `search={false}` drops the field for a list short enough to read at a glance; `loading` puts a strip where the list goes, because an async picker with no state reads as an empty one."
			/>

			<Example
				example="popover-menu/popover-menu-states"
				title="Error and minimum search"
				description="`error` stands where the rows would — `true` for `strings.error`, or a node of your own — and `onRetry` puts a control under it. It gives way to `loading`, so a retry in flight never shows beside the failure it is answering. `minSearchLength` keeps an empty field browsable and shows `strings.formatTypeToSearch` for one character up to the minimum."
			/>

			<Example
				example="popover-menu/popover-menu-panel"
				title="PopoverMenuPanel"
				description="The same header, search, rows, states and footer without the popover, for a surface something else already owns — one step of a two-step popup, a sheet, a pill whose popover anchors to the whole pill. It owns no selection and closes nothing; the host decides both. The filter editors are built on it."
			/>

			<Example id="popover-menu-composition" title="What it is made of">
				<Callout label="Two components, five regions">
					A <code>Popover</code> at <code>inset="flush"</code> with a <code>Command</code>{" "}
					inside it. Flush is what lets the header and footer run edge to edge, and it is why
					each band carries its own inset rather than inheriting the surface&rsquo;s. The list,
					its search field, its filtering and its empty row are all Command&rsquo;s — this
					component adds the trigger, the two bands, and the loading strip, and nothing else.
				</Callout>
				<Callout label="Where the filtering happens">
					The local matcher runs until you pass <code>onSearchChange</code>. Supplying it hands
					filtering to you and the matcher steps aside, rather than filtering an already
					filtered list — which is how a server-side search ends up showing nothing.
				</Callout>
				<Callout label="When to reach past it">
					This is a bounded convenience over Popover and Command, not a replacement for them.
					A shape outside &ldquo;trigger → header → search → list → footer&rdquo; — two lists
					side by side, a tree, a form in the panel — composes those two directly. Reaching for
					a <code>renderItem</code> that rebuilds the whole row for every item is the usual sign
					you have left the shape this component covers.
				</Callout>
			</Example>

			<Example id="popover-menu-which" title="Which of the five">
				<Callout label="It answers a question">
					<strong>PopoverMenu</strong> picks a value from a button.{" "}
					<strong>Select</strong> picks a value in a form — the field is the control, and it has
					a name and a form value. <strong>Combobox</strong> is the same job as parts rather
					than a recipe, for a field that has to be composed: multi-select, async, chips.
				</Callout>
				<Callout label="It does not run anything">
					<strong>ActionMenu</strong> and <strong>DropdownMenu</strong> sit behind the same kind
					of trigger and carry VERBS — rename, duplicate, delete. A menu whose rows are things
					that happen is one of those; a menu whose rows are things you can be is this one.{" "}
					<strong>Command</strong> is the palette over the whole application, not a picker on
					one control.
				</Callout>
			</Example>

			<Example id="popover-menu-api" title="API">
				<PropTable owners={["PopoverMenu", "PopoverMenuItem", "PopoverMenuStrings"]} />
				<PropTable owners={["PopoverMenuPanel"]} />
			</Example>
		</ComponentPage>
	)
}
