import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ActionsPage() {
	return (
		<ComponentPage>
			<Example
				example="actions/actions"
				title="One definition, many surfaces"
				description="Register once with useRegisterActions, then read the same action from each surface. Both controls below drive the same definition with different payloads, and both open the same confirm dialog through the outlet."
			/>

			<Example id="actions-rule" title="Behaviour lives in callbacks">
				<Callout label="Rule">
					The service imports no router, no data layer, no toast package, and no auth.
					An action's <code>run</code> is a callback the application supplies — which is
					what keeps one runtime usable across products that agree on none of those.
				</Callout>
			</Example>

			<Example id="actions-api" title="API">
				<PropTable
					symbols={[
						"ActionProvider",
						"ActionOverlayOutlet",
						"ActionScope",
						"defineAction",
						"defineFormAction",
						"defineDeleteAction",
						"defineSilentAction",
						"useRegisterActions",
						"useActionSurface",
						"useAction",
						"useLocalAction",
						"useActiveAction",
						"useActionScope",
						"useActionSnapshot",
						"useActionStore",
						"ActionHttpError",
					]}
				/>
				<PropTable owners={["features/actions#ActionDefinition"]} />
			</Example>
		</ComponentPage>
	)
}
