import { CalendarIcon, FileTextIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import {
	CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "themelia-ui/base/command"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function CommandDialogExample() {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault()
				setOpen((current) => !current)
			}
		}
		document.addEventListener("keydown", onKey)
		return () => document.removeEventListener("keydown", onKey)
	}, [])

	return (
		<Stack direction="horizontal" align="center">
			<Button appearance="outline" tone="neutral" onClick={() => setOpen(true)}>
				Open palette
			</Button>
			<Text size="sm" type="secondary">or press ⌘K</Text>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search…" />
				<CommandList>
					<CommandEmpty>No results.</CommandEmpty>
					<CommandGroup heading="Pages">
						<CommandItem><FileTextIcon />Invoices</CommandItem>
						<CommandItem><CalendarIcon />Schedule</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</Stack>
	)
}
