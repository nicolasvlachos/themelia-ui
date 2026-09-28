import {
	AlertDialogAction, AlertDialogCancel, AlertDialogContent,
} from "themelia-ui/base/alert-dialog"
import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayBody, OverlayDescription, OverlayFooter, OverlayHeader, OverlayTitle,
	OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function AlertDialog() {
	return (
		<Stack gap="sm" direction="horizontal">
			<Overlay>
				<OverlayTrigger render={<Button tone="destructive" appearance="outline" />}>
					Delete account
				</OverlayTrigger>
				<AlertDialogContent>
					<OverlayHeader>
						<OverlayTitle>Delete this account?</OverlayTitle>
						<OverlayDescription>This cannot be undone.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Text type="secondary">Every project and invoice is removed permanently.</Text>
					</OverlayBody>
					<OverlayFooter>
						<AlertDialogCancel render={<Button tone="neutral" appearance="outline" />}>
							Cancel
						</AlertDialogCancel>
						{/* The answer is an Action, not a second Cancel: they read the same only until a caller hooks the one that commits. */}
						<AlertDialogAction render={<Button tone="destructive" />}>
							Delete
						</AlertDialogAction>
					</OverlayFooter>
				</AlertDialogContent>
			</Overlay>
		</Stack>
	)
}
