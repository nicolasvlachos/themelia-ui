import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MenubarPage() {
	return (
		<ComponentPage
			title="Menubar"
			summary="The menu bar of a desktop application, for an editor or a workspace with more commands than a toolbar can show. The bar and its triggers come from here; the menus themselves are the dropdown menu's, imported from base/dropdown-menu beside it."
			importPath="@/components/base/menubar"
			exports={["Menubar", "MenubarTrigger"]}
		>
			<Example
				example="menubar/menubar"
				title="Menubar"
				description="A row of menus where moving sideways opens the next without a second click — that behaviour is the whole component, and the reason it is not several dropdowns in a flex row. Each menu is the dropdown menu's own — a DropdownMenu root, a MenubarTrigger for its word in the bar, and DropdownMenuContent with its rows — so a menu here matches one anywhere. Reach for it for an editor; an admin screen almost always wants a toolbar and an ActionMenu."
				stacked
			/>

			<Example id="menubar-api" title="API">
				<PropTable
					rows={[
						{ name: "Menubar", type: "component", description: "The bar. Its menus are DropdownMenu roots, each with a MenubarTrigger and DropdownMenuContent holding every row the dropdown menu offers." },
						{ name: "MenubarTrigger", type: "component", description: "One menu’s word in the bar, placed inside a DropdownMenu beside its DropdownMenuContent. Once a menu is open, moving along the bar opens the next without a second click — which is what makes a menubar a menubar rather than a row of dropdowns." },
						{ name: "DropdownMenu / DropdownMenuContent / DropdownMenuItem / DropdownMenuSeparator / DropdownMenuShortcut", api: ["@/components/base/dropdown-menu#DropdownMenu", "@/components/base/dropdown-menu#DropdownMenuContent", "@/components/base/dropdown-menu#DropdownMenuItem", "@/components/base/dropdown-menu#DropdownMenuSeparator", "@/components/base/dropdown-menu#DropdownMenuShortcut"], type: "component", description: "The menu itself is the dropdown menu family’s, not a copy under a second name — so groups, labels, checkbox and radio items, submenus and the portal are the dropdown menu’s parts too, and a reader who has learned one has learned the other." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
