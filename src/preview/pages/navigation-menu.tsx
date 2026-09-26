import {
	NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger,
	NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator,
} from "@/components/base/navigation-menu"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function NavigationMenuPage() {
	return (
		<ComponentPage
			title="Navigation menu"
			summary="A horizontal bar whose entries open a panel of links — the mega-menu of a marketing header, a product switcher, a section whose children are worth previewing. It does not know which route is current, so an application's own navigation belongs in SideNav, NavigationTabs or AppSidebar."
			importPath="@/components/base/navigation-menu"
			exports={[
				"NavigationMenu", "NavigationMenuList", "NavigationMenuItem", "NavigationMenuTrigger",
				"NavigationMenuContent", "NavigationMenuLink", "NavigationMenuIndicator",
			]}
		>
			<Example
				id="navigation-menu"
				title="Navigation menu"
				description="Grouped destinations use links. Use a menubar for commands in the current view; use the navigation menu for moving to another section."
				code={`<NavigationMenu aria-label="Documentation">
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        Guides <NavigationMenuIndicator />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="#/page">Page layouts</NavigationMenuLink>
        <NavigationMenuLink href="#/data-view">Data views</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#/tokens">Tokens</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
			>
				<NavigationMenu aria-label="Documentation">
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger>
								Guides <NavigationMenuIndicator />
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<NavigationMenuLink href="#/page">Page layouts</NavigationMenuLink>
								<NavigationMenuLink href="#/data-view">Data views</NavigationMenuLink>
								<NavigationMenuLink href="#/form-field">Forms</NavigationMenuLink>
							</NavigationMenuContent>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuTrigger>
								Components <NavigationMenuIndicator />
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<NavigationMenuLink href="#/button">Buttons</NavigationMenuLink>
								<NavigationMenuLink href="#/card">Cards</NavigationMenuLink>
								<NavigationMenuLink href="#/overlay">Overlays</NavigationMenuLink>
								<NavigationMenuLink href="#/table">Tables</NavigationMenuLink>
							</NavigationMenuContent>
						</NavigationMenuItem>
						<NavigationMenuItem>
							{/* A destination with nothing to preview is a link in the bar, with no caret. */}
							<NavigationMenuLink href="#/tokens">Tokens</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</Example>

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
