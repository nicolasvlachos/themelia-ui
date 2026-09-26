import { CalendarIcon, FileTextIcon, SettingsIcon, UserIcon } from "lucide-react"

import {
	Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
	CommandSeparator, CommandShortcut,
} from "themelia-ui/base/command"


export default function CommandExample() {
	return (
		<div style={{ maxWidth: "26rem", width: "100%" }}>
			<Command>
				<CommandInput placeholder="Type a command or search…" />
				<CommandList>
					<CommandEmpty>No results.</CommandEmpty>
					<CommandGroup heading="Pages">
						<CommandItem><FileTextIcon />Invoices</CommandItem>
						<CommandItem><CalendarIcon />Schedule</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Account">
						<CommandItem><UserIcon />Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
						<CommandItem><SettingsIcon />Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
		</div>
	)
}
