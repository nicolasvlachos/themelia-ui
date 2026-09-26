import { ActionMenu, type ActionDefinition } from "themelia-ui/base/action-menu"
import { Button, TooltipButton } from "themelia-ui/base/buttons"
import { Select } from "themelia-ui/base/choice-inputs"
import { FormField } from "themelia-ui/base/forms"
import {
	Overlay, OverlayBody, OverlayContent, OverlayDescription, OverlayDismissArea, OverlayFooter,
	OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"

const ROLES = [
	{ value: "viewer", label: "Viewer" },
	{ value: "member", label: "Member" },
	{ value: "admin", label: "Admin" },
	{ value: "owner", label: "Owner" },
]

const INVITE_ACTIONS: ActionDefinition[] = [
	{ label: "Invite several people", onClick: () => {} },
	{ label: "Import from a CSV", onClick: () => {} },
	{ label: "Invite settings", onClick: () => {}, group: true },
]

export default function DialogPopups() {
	return (
		<Stack direction="horizontal">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Invite member
				</OverlayTrigger>
				<OverlayContent>
					<OverlayHeader>
						<OverlayTitle>Invite member</OverlayTitle>
						<OverlayDescription>They receive an email with a link to join.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Stack gap="md">
							<FormField label="Email">
								<Input placeholder="name@example.com" />
							</FormField>
							<FormField label="Role" hint="Admins can manage billing.">
								<Select options={ROLES} defaultValue="member" />
							</FormField>
						</Stack>
					</OverlayBody>
					<OverlayFooter>
						<Stack direction="horizontal" gap="md" align="center" wrap>
							<ActionMenu actions={INVITE_ACTIONS} label="More" />
							<TooltipButton tooltip="Copy an invite link instead" tone="neutral" buttonStyle="ghost">
								Copy link
							</TooltipButton>
							<OverlayDismissArea>
								<Button tone="neutral" buttonStyle="outline">Cancel</Button>
								<Button>Send invite</Button>
							</OverlayDismissArea>
						</Stack>
					</OverlayFooter>
				</OverlayContent>
			</Overlay>
		</Stack>
	)
}
