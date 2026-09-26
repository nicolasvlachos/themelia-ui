import { BoldIcon, ItalicIcon, Redo2Icon, Undo2Icon } from "lucide-react"

import { Stack } from "@/components/base/structure"
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarInput,
	ToolbarLink,
	ToolbarSeparator,
} from "@/components/base/toolbar"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ToolbarPage() {
	return (
		<ComponentPage
			title="Toolbar"
			summary="A named set of related controls with one tab stop. Tab enters or leaves the set; arrow keys move within it according to orientation."
			importPath="@/components/base/toolbar"
			exports={[
				"Toolbar",
				"ToolbarGroup",
				"ToolbarButton",
				"ToolbarLink",
				"ToolbarInput",
				"ToolbarSeparator",
			]}
		>
			<Example
				id="toolbar"
				title="Formatting controls"
				description="The buttons use the public Button appearance while Base UI owns roving focus, orientation, disabled-item behavior, and arrow navigation."
				code={`<Toolbar aria-label="Formatting">
  <ToolbarGroup>
    <ToolbarButton iconOnly aria-label="Bold"><BoldIcon /></ToolbarButton>
    <ToolbarButton iconOnly aria-label="Italic"><ItalicIcon /></ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarInput aria-label="Font size" defaultValue="14" inputMode="numeric"
    style={{ width: "calc(4rem * var(--scale))" }} />
</Toolbar>`}
			>
				<Toolbar aria-label="Formatting">
					<ToolbarGroup>
						<ToolbarButton iconOnly aria-label="Bold">
							<BoldIcon />
						</ToolbarButton>
						<ToolbarButton iconOnly aria-label="Italic">
							<ItalicIcon />
						</ToolbarButton>
					</ToolbarGroup>
					<ToolbarSeparator />
					<ToolbarGroup>
						<ToolbarButton iconOnly aria-label="Undo">
							<Undo2Icon />
						</ToolbarButton>
						<ToolbarButton iconOnly aria-label="Redo" disabled>
							<Redo2Icon />
						</ToolbarButton>
					</ToolbarGroup>
					<ToolbarSeparator />
					<ToolbarInput aria-label="Font size" defaultValue="14" inputMode="numeric" style={{ width: "calc(4rem * var(--scale))" }} />
					<ToolbarLink
						href="#/toolbar"
						onClick={(event) => {
							event.preventDefault()
							document.getElementById("toolbar-api")?.scrollIntoView({ behavior: "smooth" })
						}}
					>
						API
					</ToolbarLink>
				</Toolbar>
			</Example>

			<Example
				id="toolbar-orientation"
				title="Vertical orientation"
				description="Orientation changes both layout and keyboard direction. Arrow Down replaces Arrow Right."
			>
				<Stack direction="horizontal" gap="xl" align="start">
					<Toolbar aria-label="History" orientation="vertical">
						<ToolbarButton iconOnly aria-label="Undo">
							<Undo2Icon />
						</ToolbarButton>
						<ToolbarButton iconOnly aria-label="Redo">
							<Redo2Icon />
						</ToolbarButton>
					</Toolbar>
				</Stack>
			</Example>

			<Example id="toolbar-api" title="API">
				<PropTable
					rows={[
						{ name: "Toolbar", type: "Root", description: "role=toolbar, orientation, disabled state, loopFocus, and one roving tab stop." },
						{ name: "ToolbarGroup", type: "Group", description: "Groups related items and can disable the group as one unit." },
						{ name: "ToolbarButton", type: "Button", description: "Base UI navigation behavior rendered through the kit Button. Supports tone, buttonStyle, iconOnly, loading, and render." },
						{ name: "ToolbarLink / ToolbarInput", type: "item", description: "Anchor and native input items that participate in the same roving-focus order." },
						{ name: "ToolbarSeparator", type: "Separator", description: "Defaults to the opposite orientation of the toolbar." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
