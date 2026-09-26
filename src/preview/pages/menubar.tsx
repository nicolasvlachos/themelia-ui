import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MenubarPage() {
	return (
		<ComponentPage>
			<Example
				example="menubar/menubar"
				title="Menubar"
				description="A row of menus where moving sideways opens the next without a second click — that behaviour is the whole component, and the reason it is not several dropdowns in a flex row. Each menu is the dropdown menu's own — a DropdownMenu root, a MenubarTrigger for its word in the bar, and DropdownMenuContent with its rows — so a menu here matches one anywhere. Reach for it for an editor; an admin screen almost always wants a toolbar and an ActionMenu."
			/>

			<Example id="menubar-api" title="API">
				<PropTable owners={["Menubar", "MenubarTrigger"]} />
				<PropTable
					symbols={[
						"DropdownMenu",
						"DropdownMenuContent",
						"DropdownMenuItem",
						"DropdownMenuSeparator",
						"DropdownMenuShortcut",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
