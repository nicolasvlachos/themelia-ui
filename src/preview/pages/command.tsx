import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CommandPage() {
	return (
		<ComponentPage
			title="Command"
			summary="The command palette. A filtered list over an input, either inline or in a dialog bound to a shortcut."
			importPath="@/components/base/command"
			exports={["Command", "CommandDialog", "CommandInput", "CommandList", "CommandEmpty", "CommandGroup", "CommandItem", "CommandShortcut", "CommandSeparator"
			]}
		>
			<Example
				example="command/command"
				title="Command"
				description="Inline, for a palette that lives in a panel. The empty state is a required child rather than an optional one — a filter that matches nothing has to say so, or it reads as broken."
				stacked
			/>

			<Example
				example="command/command-dialog"
				title="CommandDialog"
				description="The same palette in an overlay, on a shortcut. Binding the key is the caller's job — the component does not install a global listener, because a library that grabs ⌘K takes it from whatever the app already used it for."
				stacked
			/>

			<Example id="command-api" title="API">
				<PropTable
					rows={[
						{ name: "CommandInput", type: "component", description: "The filter. Owns focus when the palette opens." },
						{ name: "CommandEmpty", type: "component", description: "Shown when nothing matches. Not optional — a silent empty list reads as broken." },
						{ name: "CommandGroup heading", type: "string", description: "A captioned block of rows." },
						{ name: "CommandItem value / onSelect", type: "string / () => void", description: "value is what the filter matches; the label is what is read." },
						{ name: "CommandShortcut", type: "component", description: "The key hint at the end of a row." },
						{ name: "CommandDialog open / onOpenChange", type: "boolean", description: "The overlay form. The caller binds the shortcut." },
						{ name: "CommandDialog commandProps", type: "CommandProps", description: "Configures the cmdk root the dialog owns: custom filtering, looping, labels, and other command behavior." },
						{ name: "CommandSeparator", type: "component", description: "The rule between groups. Presentational and skipped by the keyboard, so arrowing through results never lands on it." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
