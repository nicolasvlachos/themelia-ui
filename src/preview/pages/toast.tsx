import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ToastPage() {
	return (
		<ComponentPage>
			<Example
				example="toast/toast-statuses"
				title="Statuses"
				description="One surface, six glyphs. The pill stays inverse in every case: a coloured surface for every status turns a notification layer into a traffic light, and the status is already carried by the icon and the wording."
			/>

			<Example
				example="toast/toast-actions"
				title="Actions"
				description="A toast with an action is the undo affordance for anything destructive that already happened. Hovering or focusing the region pauses every timer, so the action is still there when the reader reaches for it."
			/>

			<Example
				example="toast/toast-promise"
				title="Promise"
				description="One toast changing state rather than three stacking. Passing the same id is what makes the loading toast become the outcome in place."
			/>

			<Example id="toast-rule" title="Where the queue lives">
				<Callout label="Rule">
					Mount <code>&lt;Toaster /&gt;</code> once at the application root. The default queue
					is a module-level store, so <code>toast()</code> needs no hook, no context, and no
					ref threaded down the tree — which is the only way a catch block in a data loader
					can raise one at all. When a page has two independent Toasters — a host
					application and an embedded widget — give each its own{" "}
					<code>createToastStore()</code>, or they render each other's toasts and hovering
					one pauses the other's timers.
				</Callout>
			</Example>

			<Example id="toast-api" title="API">
				<PropTable symbols={["toast", "createToastStore"]} />
				<PropTable owners={["Toaster", "ToastOptions", "ToastAction"]} />
			</Example>
		</ComponentPage>
	)
}
