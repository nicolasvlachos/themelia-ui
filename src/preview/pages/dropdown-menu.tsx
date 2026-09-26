import { ChevronDownIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/base/buttons"
import {
	ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup,
	ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut,
	ContextMenuTrigger,
} from "@/components/base/context-menu"
import {
	DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
	DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
	DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent,
	DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { UIProvider } from "@/lib/ui-provider"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DropdownMenuPage() {
	const [dense, setDense] = useState(false)
	const [sort, setSort] = useState("date")
	const [contextDense, setContextDense] = useState(false)

	return (
		<ComponentPage
			title="Dropdown & context menu"
			summary="The composable menu underneath ActionMenu, opened from a trigger or by right-click. Reach for it when the definition-driven ActionMenu cannot express the menu you need — a submenu, a radio group, a custom row. The context menu reuses these rows wholesale, so it lives here."
			importPath="@/components/base/dropdown-menu"
			exports={["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem", "DropdownMenuCheckboxItem", "DropdownMenuRadioGroup", "DropdownMenuSub", "DropdownMenuGroup", "DropdownMenuLabel", "DropdownMenuSeparator", "DropdownMenuShortcut", "DropdownMenuRadioItem", "DropdownMenuSubTrigger", "DropdownMenuSubContent", "DropdownMenuPortal", "DropdownMenuLinkItem"
			]}
			alsoImports={[
				{ importPath: "@/components/base/context-menu", title: "Context menu", exports: ["ContextMenu", "ContextMenuTrigger", "ContextMenuContent", "ContextMenuItem", "ContextMenuGroup", "ContextMenuLabel", "ContextMenuSeparator", "ContextMenuShortcut", "ContextMenuCheckboxItem", "ContextMenuRadioGroup", "ContextMenuRadioItem", "ContextMenuSub", "ContextMenuSubTrigger", "ContextMenuSubContent", "ContextMenuPortal"] },
			]}
		>
			<Example
				id="dropdown-menu"
				title="Dropdown menu"
				description="Rows use the shared menu row, so this matches the action menu, the select list, and the command list beside it. A group label must sit inside a group — Base UI throws otherwise, and it is the easiest way to break a menu."
				stacked
				code={`<DropdownMenu>
  <DropdownMenuTrigger render={<Button />}>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>…</DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`}
			>
				<Stack direction="horizontal" gap="lg">
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button buttonStyle="outline" tone="neutral" />}>
							Options <ChevronDownIcon />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuGroup>
								<DropdownMenuLabel>Document</DropdownMenuLabel>
								<DropdownMenuItem>
									Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>Duplicate</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuCheckboxItem checked={dense} onCheckedChange={setDense}>
								Dense rows
							</DropdownMenuCheckboxItem>
							<DropdownMenuSeparator />
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Sort by</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
										<DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuContent>
					</DropdownMenu>
				</Stack>
			</Example>

			<Example
				id="context-menu"
				title="Opened by right-click"
				description="ContextMenu is the same menu over a region instead of a button. Every row is the dropdown's row — the group label, the shortcut, the checkbox item, the destructive variant all behave identically. Right-click the panel."
				stacked
				code={`<ContextMenu>
  <ContextMenuTrigger render={<div />}>…</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem icon={<PencilIcon />}>Edit</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
			>
				<ContextMenu>
					<ContextMenuTrigger
						render={
							<div
								style={{
									display: "grid",
									placeItems: "center",
									width: "100%",
									minHeight: "8rem",
									border: "1px dashed var(--border)",
									borderRadius: "var(--radius)",
								}}
							/>
						}
					>
						<Text type="secondary">Right-click anywhere in this panel</Text>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuGroup>
							{/* `inset` puts rows without an icon on the same label column as rows with one. */}
							<ContextMenuLabel inset>Invoice</ContextMenuLabel>
							<ContextMenuItem icon={<PencilIcon />}>
								Edit <ContextMenuShortcut>⌘E</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem icon={<CopyIcon />}>Duplicate</ContextMenuItem>
						</ContextMenuGroup>
						<ContextMenuSeparator />
						<ContextMenuCheckboxItem inset checked={contextDense} onCheckedChange={setContextDense}>
							Dense rows
						</ContextMenuCheckboxItem>
						<ContextMenuSeparator />
						<ContextMenuItem variant="destructive" icon={<Trash2Icon />}>
							Delete
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			</Example>

			<Example
				id="dropdown-scheme"
				title="Dark by default, decided by the provider"
				description="Menus render dark on a light page: a transient command surface set apart from the content it floats over, without a heavier shadow. The provider owns the choice — overlay.darkMenus: false lets every dropdown, context menu, action menu and menubar follow the page instead."
				stacked
				code={`<UIProvider config={{ overlay: { darkMenus: false } }}>
  <App />
</UIProvider>`}
			>
				<Stack direction="horizontal" gap="lg">
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button buttonStyle="outline" tone="neutral" />}>
							Default <ChevronDownIcon />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem icon={<PencilIcon />}>Edit</DropdownMenuItem>
							<DropdownMenuItem icon={<CopyIcon />}>Duplicate</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<UIProvider config={{ overlay: { darkMenus: false } }}>
						<DropdownMenu>
							<DropdownMenuTrigger render={<Button buttonStyle="outline" tone="neutral" />}>
								Follows the page <ChevronDownIcon />
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem icon={<PencilIcon />}>Edit</DropdownMenuItem>
								<DropdownMenuItem icon={<CopyIcon />}>Duplicate</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</UIProvider>
				</Stack>
			</Example>

			<Example id="dropdown-rule" title="ActionMenu first" stacked>
				<Callout label="Rule">
					Use <code>ActionMenu</code> unless you cannot. It takes the commands as data, so
					grouping, the destructive ordering, the checkbox rows, and the link handling are
					decided once — and those are precisely the parts everyone gets subtly different
					when assembling menu items by hand.
				</Callout>
			</Example>

			<Example id="context-menu-rule" title="A right-click is never the only route" stacked>
				<Callout label="Rule">
					Every command in a context menu must be reachable another way. A right-click is
					undiscoverable, absent on touch, and awkward from a keyboard — it is an
					accelerator for what a toolbar or an <code>ActionMenu</code> already offers.
				</Callout>
			</Example>

			<Example id="dropdown-menu-api" title="API">
				<PropTable
					rows={[
						{ name: "DropdownMenuTrigger render", type: "ReactElement", description: "The control the menu hangs off." },
						{ name: "DropdownMenuContent width / maxWidth", type: 'string | number | "trigger"', description: "Sizes to the widest row by default, capped at a reading measure." },
						{ name: "DropdownMenuLabel", type: "component", description: "A group caption. MUST be inside a DropdownMenuGroup — it throws otherwise." },
						{ name: "DropdownMenuCheckboxItem checked / onCheckedChange", type: "boolean", description: "A row that toggles rather than closing." },
						{ name: "DropdownMenuRadioGroup value / onValueChange", type: "string", description: "One choice from the menu." },
						{ name: "DropdownMenuSub", type: "component", description: "A nested menu. Trigger, then SubContent." },
						{ name: "DropdownMenuGroup / DropdownMenuLabel / DropdownMenuSeparator", type: "component", description: "A titled run of items and the rule between runs. The label is not an item — it is not focusable and arrow keys skip it, which is why a styled item would be wrong here." },
						{ name: "DropdownMenuShortcut", type: "component", description: "The key hint on the trailing edge of an item. Presentational: it announces nothing, because the shortcut is already on the item that owns it." },
						{ name: "DropdownMenuRadioItem", type: "component", description: "A single-choice item inside a DropdownMenuRadioGroup, carrying its own indicator." },
						{ name: "DropdownMenuSubTrigger / DropdownMenuSubContent", type: "component", description: "The row that opens a nested menu and the panel it opens. Both belong to DropdownMenuSub, which holds the open state." },
						{ name: "DropdownMenuPortal", type: "component", description: "Escapes the menu from an ancestor that clips or transforms — a card with overflow hidden, a scrolling pane." },
						{ name: "DropdownMenuLinkItem", type: "component", description: "An item that navigates. A real anchor, so middle-click and copy-link work and a screen reader announces a link rather than a button." },
					]}
				/>
			</Example>

			<Example id="context-menu-api" title="ContextMenu API">
				<PropTable
					rows={[
						{ name: "ContextMenuTrigger render", api: "@/components/base/context-menu#ContextMenuTrigger.render", type: "ReactElement", description: "The region a right-click opens the menu over. Not a button — the whole area is the target." },
						{ name: "ContextMenuItem", api: "@/components/base/context-menu#ContextMenuItem", type: "component", description: "The dropdown's row, unchanged. icon, description, shortcut, trailing, and variant=\"destructive\" all apply." },
						{ name: "ContextMenuGroup / ContextMenuLabel / ContextMenuSeparator", api: ["@/components/base/context-menu#ContextMenuGroup", "@/components/base/context-menu#ContextMenuLabel", "@/components/base/context-menu#ContextMenuSeparator"], type: "component", description: "A titled run of items and the rule between runs. The label MUST sit inside a group — Base UI throws otherwise — and is not an item: arrow keys skip it." },
						{ name: "ContextMenuShortcut", api: "@/components/base/context-menu#ContextMenuShortcut", type: "component", description: "The key hint on an item\u2019s trailing edge. Presentational: the item already carries the accessible name." },
						{ name: "ContextMenuCheckboxItem / RadioGroup / RadioItem", api: ["@/components/base/context-menu#ContextMenuCheckboxItem", "@/components/base/context-menu#ContextMenuRadioGroup", "@/components/base/context-menu#ContextMenuRadioItem"], type: "component", description: "Rows that toggle rather than closing, and a set that behaves as one choice." },
						{ name: "ContextMenuSub / SubTrigger / SubContent", api: ["@/components/base/context-menu#ContextMenuSub", "@/components/base/context-menu#ContextMenuSubTrigger", "@/components/base/context-menu#ContextMenuSubContent"], type: "component", description: "A nested menu, opening sideways. Sub holds the open state so trigger and panel cannot disagree." },
						{ name: "ContextMenuPortal", api: "@/components/base/context-menu#ContextMenuPortal", type: "component", description: "Escapes the menu from an ancestor that clips or transforms \u2014 a card with overflow hidden, a scrolling pane." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
