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
				<PropTable
					rows={[
						{ name: "toast(title, options)", api: "toast", type: "(ReactNode, ToastOptions) => string", description: "Raises a toast and returns its id. Also .success/.info/.warning/.error/.loading/.promise/.dismiss." },
						{ name: "ToastOptions.id", type: "string", description: "Reusing an on-screen id updates that toast in place rather than stacking a second one." },
						{ name: "ToastOptions.duration", type: "number", description: "Lifetime in ms. Infinity pins it open. Falls back to the Toaster's duration." },
						{ name: "ToastOptions.action / cancel", api: ["ToastOptions.action", "ToastOptions.cancel"], type: "{ label, onClick }", description: "Buttons on the pill. Both dismiss the toast after running." },
						{ name: "Toaster position", type: "ToastPosition", default: '"bottom-end"', description: "One of six: top or bottom, crossed with start, center, or end. Bottom stacks grow upward so the newest is nearest the edge." },
						{ name: "Toaster visibleToasts", type: "number", default: "3", description: "Cap on the render, not the store — a capped toast still runs its timer and onDismiss." },
						{ name: "createToastStore", type: "() => ToastStore", description: "An independent queue with its own timers and its own bound toast(). With only the module-level queue — one for the whole realm — two Toasters on a page would render the same toasts, and pauseAll would walk a timer map neither owned. The singleton stays the default, because toast(\"Saved\") working with no wiring is the point of it." },
						{ name: "Toaster store", type: "ToastStore", default: "the singleton", description: "The queue this Toaster renders, dismisses and pauses. Pass a createToastStore() instance to isolate it." },
						{ name: "Toaster container", type: "HTMLElement | ShadowRoot", description: "Where the region portals. Defaults to the nearest UIPortalHost, then document.body — so toasts raised inside a scoped region are drawn with that region's density and theme." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
