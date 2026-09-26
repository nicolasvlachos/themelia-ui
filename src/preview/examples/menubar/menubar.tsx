import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut,
} from "themelia-ui/base/dropdown-menu"
import { Menubar, MenubarTrigger } from "themelia-ui/base/menubar"

export default function MenubarExample() {
	return (
		<Menubar>
			<DropdownMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>
						New <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>Open…</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DropdownMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>Undo</DropdownMenuItem>
					<DropdownMenuItem>Redo</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DropdownMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>Zoom in</DropdownMenuItem>
					<DropdownMenuItem>Zoom out</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</Menubar>
	)
}
