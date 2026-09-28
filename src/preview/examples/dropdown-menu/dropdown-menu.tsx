import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import {
	DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
	DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
	DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent,
	DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "themelia-ui/base/dropdown-menu"
import { Stack } from "themelia-ui/base/structure"

export default function DropdownMenuExample() {
	const [dense, setDense] = useState(false)
	const [sort, setSort] = useState("date")

	return (
		<Stack direction="horizontal">
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button appearance="outline" tone="neutral" />}>
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
	)
}
