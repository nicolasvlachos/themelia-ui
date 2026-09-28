import { TrashIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	ActionOverlayOutlet, ActionProvider, defineAction, useActionSurface, useRegisterActions,
	type ActionDefinition,
} from "themelia-ui/features/actions"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * One action registered once, read by a page toolbar and a card's overflow menu. The store
 * owns confirmation, loading and errors, so both agree.
 */
function ActionsDemo() {
	const [deleted, setDeleted] = useState<string[]>([])

	const actions: ActionDefinition[] = [
		defineAction({
			id: "invoice.delete",
			label: "Delete invoice",
			icon: TrashIcon,
			tone: "destructive",
			surfaces: ["page", "card"],
			modality: {
				type: "alert",
				title: "Delete this invoice?",
				description: "This cannot be undone.",
				confirmLabel: "Delete",
				tone: "destructive",
				closeOnSuccess: true,
			},
			run: async ({ payload }) => {
				await wait(700)
				setDeleted((current) => [...current, String(payload ?? "INV-4417")])
				return payload
			},
		}),
	]

	useRegisterActions(actions, { scope: "invoice" })

	const pageActions = useActionSurface({ surface: "page", scope: "invoice", payload: "INV-4417" })
	const cardActions = useActionSurface({ surface: "card", scope: "invoice", payload: "INV-4418" })

	return (
		<Stack style={{ width: "100%" }}>
			<Stack direction="horizontal" gap="sm" align="center">
				{pageActions.map((action) => (
					<Button
						key={action.key}
						tone={action.definition.tone}
						loading={action.isRunning}
						disabled={action.disabled}
						onClick={() => action.open()}
					>
						{action.label}
					</Button>
				))}
				<Text size="sm" type="secondary">
					page surface — payload INV-4417
				</Text>
			</Stack>

			<Card
				surface="bordered"
				title="Northwind Traders"
				description="Invoice #4418 — the same action, from a card menu."
				actions={cardActions.map((action) => ({
					label: action.label,
					icon: action.definition.icon,
					tone: action.definition.tone,
					onClick: () => action.open(),
				}))}
			>
				<Text size="sm" type="secondary">
					{deleted.length ? `Deleted: ${deleted.join(", ")}` : "Nothing deleted yet."}
				</Text>
			</Card>
		</Stack>
	)
}

export default function Actions() {
	return (
		<ActionProvider>
			<ActionsDemo />
			<ActionOverlayOutlet />
		</ActionProvider>
	)
}
