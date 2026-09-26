import { Button } from "themelia-ui/base/buttons"
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "themelia-ui/base/dropdown-menu"
import { Grid, GridCell, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIPortalHost, UIScope } from "themelia-ui/ui-provider"

/** One menu, rendered twice, so the only difference is whether a host is above it. */
function ActionsMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button buttonStyle="outline">Actions</Button>} />
			<DropdownMenuContent>
				<DropdownMenuItem>Duplicate</DropdownMenuItem>
				<DropdownMenuItem>Move to…</DropdownMenuItem>
				<DropdownMenuItem>Archive</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default function UiPortalHostExample() {
	return (
		<Grid columns={2} gap="lg">
			<GridCell>
				<Stack gap="sm">
					<Text size="xs" type="secondary">
						Compact scope, no host — the menu portals to the body
					</Text>
					<UIScope config={{ density: "compact" }}>
						<ActionsMenu />
					</UIScope>
				</Stack>
			</GridCell>
			<GridCell>
				<Stack gap="sm">
					<Text size="xs" type="secondary">
						Compact scope with a host — the menu is compact too
					</Text>
					<UIScope config={{ density: "compact" }}>
						<UIPortalHost>
							<ActionsMenu />
						</UIPortalHost>
					</UIScope>
				</Stack>
			</GridCell>
		</Grid>
	)
}
