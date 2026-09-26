import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CommandPage() {
	return (
		<ComponentPage>
			<Example
				example="command/command"
				title="Command"
				description="Inline, for a palette that lives in a panel. The empty state is a required child rather than an optional one — a filter that matches nothing has to say so, or it reads as broken."
			/>

			<Example
				example="command/command-dialog"
				title="CommandDialog"
				description="The same palette in an overlay, on a shortcut. Binding the key is the caller's job — the component does not install a global listener, because a library that grabs ⌘K takes it from whatever the app already used it for."
			/>

			<Example id="command-api" title="API">
				<PropTable owners={["CommandDialog", "CommandGroup", "CommandItem"]} />
				<PropTable symbols={["CommandInput", "CommandEmpty", "CommandShortcut", "CommandSeparator"]} />
			</Example>
		</ComponentPage>
	)
}
