import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DropdownMenuPage() {
	return (
		<ComponentPage>
			<Example
				example="dropdown-menu/dropdown-menu"
				title="Dropdown menu"
				description="Rows use the shared menu row, so this matches the action menu, the select list, and the command list beside it. A group label must sit inside a group — Base UI throws otherwise, and it is the easiest way to break a menu."
			/>

			<Example
				example="dropdown-menu/context-menu"
				title="Opened by right-click"
				description="ContextMenu is the same menu over a region instead of a button. Every row is the dropdown's row — the group label, the shortcut, the checkbox item, the destructive variant all behave identically. Right-click the panel."
			/>

			<Example
				example="dropdown-menu/dropdown-scheme"
				title="Dark by default, decided by the provider"
				description="Menus render dark on a light page: a transient command surface set apart from the content it floats over, without a heavier shadow. The provider owns the choice — overlay.darkMenus: false lets every dropdown, context menu, action menu and menubar follow the page instead."
			/>

			<Example id="dropdown-rule" title="ActionMenu first">
				<Callout label="Rule">
					Use <code>ActionMenu</code> unless you cannot. It takes the commands as data, so
					grouping, the destructive ordering, the checkbox rows, and the link handling are
					decided once — and those are precisely the parts everyone gets subtly different
					when assembling menu items by hand.
				</Callout>
			</Example>

			<Example id="context-menu-rule" title="A right-click is never the only route">
				<Callout label="Rule">
					Every command in a context menu must be reachable another way. A right-click is
					undiscoverable, absent on touch, and awkward from a keyboard — it is an
					accelerator for what a toolbar or an <code>ActionMenu</code> already offers.
				</Callout>
			</Example>

			<Example id="dropdown-menu-api" title="API">
				<PropTable
					owners={[
						"DropdownMenuTrigger",
						"DropdownMenuContent",
						"DropdownMenuItem",
						"DropdownMenuCheckboxItem",
						"DropdownMenuRadioGroup",
					]}
				/>
				<PropTable
					symbols={[
						"DropdownMenu",
						"DropdownMenuGroup",
						"DropdownMenuLabel",
						"DropdownMenuSeparator",
						"DropdownMenuShortcut",
						"DropdownMenuRadioItem",
						"DropdownMenuLinkItem",
						"DropdownMenuSub",
						"DropdownMenuSubTrigger",
						"DropdownMenuSubContent",
						"DropdownMenuPortal",
					]}
				/>
			</Example>

			<Example id="context-menu-api" title="ContextMenu API">
				<PropTable
					symbols={[
						"ContextMenu",
						"ContextMenuTrigger",
						"ContextMenuContent",
						"ContextMenuItem",
						"ContextMenuGroup",
						"ContextMenuLabel",
						"ContextMenuSeparator",
						"ContextMenuShortcut",
						"ContextMenuCheckboxItem",
						"ContextMenuRadioGroup",
						"ContextMenuRadioItem",
						"ContextMenuSub",
						"ContextMenuSubTrigger",
						"ContextMenuSubContent",
						"ContextMenuPortal",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
