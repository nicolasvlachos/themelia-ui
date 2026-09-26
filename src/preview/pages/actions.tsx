import { TrashIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/base/buttons"
import { Card } from "@/components/base/cards"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	ActionOverlayOutlet, ActionProvider, defineAction, useActionSurface, useRegisterActions,
	type ActionDefinition,
} from "@/components/features/actions"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

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
		<Stack gap="xl" style={{ width: "100%" }}>
			<Stack direction="horizontal" gap="md" align="center">
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

export function ActionsPage() {
	return (
		<ComponentPage
			title="Actions"
			summary="One typed action definition, rendered by every surface that shows actions — a page toolbar, a card menu, a table row, the command palette — with the confirm, the loading state, and the errors owned in one place."
			importPath="themelia-ui/features/actions"
			exports={[
				"ActionProvider",
				"ActionOverlayOutlet",
				"ActionScope",
				"ActionHttpError",
				"defineAction",
				"useRegisterActions",
				"useActionSurface",
				"useAction",
				"useLocalAction",
				"useActiveAction",
				"useActionScope",
				"useActionSnapshot",
				"useActionStore",
			]}
		>
			<Example
				id="actions"
				title="One definition, many surfaces"
				description="Register once with useRegisterActions, then read the same action from each surface. Both controls below drive the same definition with different payloads, and both open the same confirm dialog through the outlet."
				stacked
				code={`const actions = [defineAction({
  id: "invoice.delete",
  label: "Delete invoice",
  surfaces: ["page", "card"],
  modality: { type: "alert", title: "Delete this invoice?", tone: "destructive" },
  run: async ({ payload }) => api.delete(payload),
})]

useRegisterActions(actions, { scope: "invoice" })
const pageActions = useActionSurface({ surface: "page", scope: "invoice", payload: id })`}
			>
				<ActionProvider>
					<ActionsDemo />
					<ActionOverlayOutlet />
				</ActionProvider>
			</Example>

			<Example id="actions-rule" title="Behaviour lives in callbacks" stacked>
				<Callout label="Rule">
					The service imports no router, no data layer, no toast package, and no auth.
					An action's <code>run</code> is a callback the application supplies — which is
					what keeps one runtime usable across products that agree on none of those.
				</Callout>
			</Example>

			<Example id="actions-api" title="API">
				<PropTable
					rows={[
						{ name: "ActionProvider", type: "component", description: "One near the app shell. Owns the registry and the run state." },
						{ name: "ActionOverlayOutlet", type: "component", description: "One inside the provider. Renders the active action's modality — alert, dialog, or drawer." },
						{ name: "defineAction", type: "(definition) => ActionDefinition", description: "Identity helper that keeps the generics inferred. Also defineFormAction, defineDeleteAction, defineSilentAction." },
						{ name: "useRegisterActions", type: "(actions, { scope }) => void", description: "Registers for as long as the component is mounted." },
						{ name: "useActionSurface", type: "({ surface, scope, payload }) => ResolvedAction[]", description: "The actions for one surface, already filtered by visibility, permission, and guards." },
						{ name: "useAction", type: "(id, options) => ResolvedAction | null", description: "One action by id, when a surface is not the right shape." },
						{ name: "ActionScope", type: "component", description: "Declarative registration, for actions that belong to a subtree rather than a component." },
						{ name: "definition.modality", api: "ActionDefinition.modality", type: '"none" | ActionModalityConfig', description: "How the action asks. The outlet renders it; no surface needs its own dialog." },
						{ name: "definition.request", api: "ActionDefinition.request", type: "ActionRequestConfig", description: "A declarative request, run by requestRunner — for apps whose actions are mostly HTTP." },
						{ name: "definition.parseErrors", api: "ActionDefinition.parseErrors", type: "ActionErrorParser", description: "Turns a failure into field errors, so a form modality can show them inline." },
						{ name: "useLocalAction", type: "(definition, options) => ResolvedAction", description: "One action registered for the lifetime of the component that declares it, for a definition no other surface needs." },
						{ name: "useActiveAction", type: "() => ResolvedAction | null", description: "Whichever action is currently open. The outlet reads this; a bespoke outlet would too." },
						{ name: "useActionScope", type: "() => string", description: "The nearest ActionScope's id, or the global scope. For a surface resolving its own actions." },
						{ name: "useActionSnapshot", type: "() => ActionStoreSnapshot", description: "Subscribes to the whole store. Prefer a narrower hook — this re-renders on any registry or run change." },
						{ name: "useActionStore", type: "() => ActionStore", description: "The store itself, for logic the hooks do not cover. Throws outside an ActionProvider rather than returning null." },
						{ name: "ActionHttpError", type: "class extends Error", description: "Thrown by createHttpActionRunner, carrying status, statusText, body and the Response. What parseErrors receives for an HTTP failure." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
