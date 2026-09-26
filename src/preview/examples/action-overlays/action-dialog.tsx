import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { Text } from "themelia-ui/base/typography"
import { ActionDialog } from "themelia-ui/features/overlays"

import { wait } from "./data"

export default function ActionDialogExample() {
	const [saved, setSaved] = useState<string | null>(null)
	const [failure, setFailure] = useState<string | null>(null)

	return (
		<Stack direction="horizontal" gap="lg" wrap align="center">
			<Stack direction="horizontal" gap="lg" wrap>
				<ActionDialog
					title="Rename workspace"
					description="The name appears in the sidebar and in invitations."
					trigger={<Button tone="neutral" buttonStyle="outline">Plain</Button>}
					onConfirm={() => setSaved("renamed")}
				>
					<FormField label="Name">
						<Input defaultValue="Northwind Traders" />
					</FormField>
				</ActionDialog>

				<ActionDialog
					title="Publish this release?"
					description="It becomes visible to every workspace member."
					tone="warning"
					emphasis
					showIcon
					alertMessage="Members are notified by email as soon as it publishes."
					trigger={<Button tone="neutral" buttonStyle="outline">Toned</Button>}
					onConfirm={() => setSaved("published")}
				/>

				<ActionDialog
					title="Saving takes a moment"
					description="The confirm shows a spinner and both buttons disable until it settles."
					trigger={<Button tone="neutral" buttonStyle="outline">Async confirm</Button>}
					onAsyncConfirm={async () => {
						await wait(1200)
						setSaved("saved after a delay")
					}}
				/>

				<ActionDialog
					title="This one fails"
					alertMessage={failure}
					tone="destructive"
					onOpenChange={() => setFailure(null)}
					description="A rejection leaves the overlay open and reports through onError — closing it would take the form away at the moment you most need to see what went wrong."
					trigger={<Button tone="neutral" buttonStyle="outline">Async that rejects</Button>}
					onAsyncConfirm={async () => {
						await wait(900)
						throw new Error("Could not reach the server")
					}}
					onError={(error) => { setFailure((error as Error).message); setSaved(`failed: ${(error as Error).message}`) }}
				/>
			</Stack>
			{!!saved && (
				<Text size="sm" type="secondary">
					last result: {saved}
				</Text>
			)}
		</Stack>
	)
}
