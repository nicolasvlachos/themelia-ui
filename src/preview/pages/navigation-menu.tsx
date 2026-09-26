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
					rows={[
						{ name: "NavigationMenu / NavigationMenuList / NavigationMenuItem", type: "component", description: "Site navigation with rich panels, in a real <nav>. Not Menubar: a menubar commands the current view, a navigation menu goes somewhere, and the difference decides whether the items are buttons or links." },
						{ name: "NavigationMenuTrigger / NavigationMenuContent / NavigationMenuLink", type: "component", description: "The word that opens a panel, the panel, and a destination inside it. The link is a real anchor, so middle-click and copy-link work and a screen reader announces a link." },
						{ name: "NavigationMenu side / sideOffset / align", api: ["NavigationMenu.side", "NavigationMenu.sideOffset", "NavigationMenu.align"], type: '"top" | "right" | "bottom" | "left" / number / "start" | "center" | "end"', default: '"bottom" / 8 / "start"', description: "Where the bar's one panel opens relative to the open entry. It lines up with the entry’s start, so a panel under the first entry never hangs past the bar’s own edge. Set on the bar, because every entry shares the panel — moving between entries resizes it rather than swapping it." },
						{ name: "NavigationMenuIndicator", type: "component", description: "The caret inside a trigger. It tells an entry that opens a panel from a link that goes somewhere, and turns while its panel is open. Brings a chevron; children replace it." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
