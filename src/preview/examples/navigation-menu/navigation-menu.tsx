import {
	NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem,
	NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "themelia-ui/base/navigation-menu"
import { Stack } from "themelia-ui/base/structure"

export default function NavigationMenuExample() {
	return (
		<Stack gap="sm" direction="horizontal">
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
		</Stack>
	)
}
