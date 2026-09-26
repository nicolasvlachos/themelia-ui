import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

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
				example="actions/actions"
				title="One definition, many surfaces"
				description="Register once with useRegisterActions, then read the same action from each surface. Both controls below drive the same definition with different payloads, and both open the same confirm dialog through the outlet."
				stacked
			/>

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
