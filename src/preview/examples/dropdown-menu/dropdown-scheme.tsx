import { ChevronDownIcon, CopyIcon, PencilIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "themelia-ui/base/dropdown-menu"
import { Stack } from "themelia-ui/base/structure"
import { UIProvider } from "themelia-ui/ui-provider"

export default function DropdownScheme() {
	return (
		<Stack direction="horizontal">
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button appearance="outline" tone="neutral" />}>
					Default <ChevronDownIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem icon={<PencilIcon />}>Edit</DropdownMenuItem>
					<DropdownMenuItem icon={<CopyIcon />}>Duplicate</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<UIProvider config={{ overlay: { darkMenus: false } }}>
				<DropdownMenu>
					<DropdownMenuTrigger render={<Button appearance="outline" tone="neutral" />}>
						Follows the page <ChevronDownIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem icon={<PencilIcon />}>Edit</DropdownMenuItem>
						<DropdownMenuItem icon={<CopyIcon />}>Duplicate</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</UIProvider>
		</Stack>
	)
}
