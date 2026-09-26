import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function NavigationMenuPage() {
	return (
		<ComponentPage>
			<Example
				example="navigation-menu/navigation-menu"
				title="Navigation menu"
				description="Grouped destinations use links. Use a menubar for commands in the current view; use the navigation menu for moving to another section."
			/>

			<Example id="navigation-menu-api" title="API">
				<PropTable
					owners={[
						"NavigationMenu",
						"NavigationMenuList",
						"NavigationMenuItem",
						"NavigationMenuTrigger",
						"NavigationMenuContent",
						"NavigationMenuLink",
						"NavigationMenuIndicator",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
