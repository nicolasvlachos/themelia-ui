import { Text, TextLink } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ActionOverlaysPage() {
	return (
		<ComponentPage>
			<Example
				example="action-overlays/action-dialog"
				title="ActionDialog"
				description="A dialog plus the footer. Cancel is first in the DOM and on the left, confirm last and on the right — fixed, not configurable, because the confirm is the one a reader reaches for without looking and a screen where it moves is a screen where they press cancel."
			/>

			<Example
				example="action-overlays/confirm-dialog"
				title="ConfirmDialog"
				description="A question and two answers, over the alert dialog — the primitive with both dismissal routes off, because a stray click outside is not an answer. It says “Continue”, not “Confirm”: the button is read as the answer to the question the title just asked."
			/>

			<Example
				example="action-overlays/action-sheet"
				title="ActionSheet"
				description="The same recipe on an edge panel, for work longer than a dialog holds. modality is the interesting prop: an inspector or a filter rail exists to sit beside the app while you keep working, which is non-modal — the page remains interactive, so use a modal confirmation for a question that must be answered."
			/>

			<Example
				example="action-overlays/overlay-visibility"
				title="Driving them from elsewhere"
				description="An overlay is uncontrolled while it hangs off its own trigger and controlled the moment something else opens it — a row action, a route, a shortcut. useOverlayVisibilityGroup keys several by name, and closeOthersOnOpen is what stops the second landing on top of the first."
			/>

			<Example id="overlays-rule" title="Which confirm path runs">
				<Callout label="Rule">
					Exactly one, resolved in order: <code>formId</code> submits that form and
					neither callback fires; otherwise <code>onConfirm</code> runs and the overlay
					closes; otherwise <code>onAsyncConfirm</code> is awaited with a spinner. The
					list short-circuits, so passing <code>onConfirm</code> alongside{" "}
					<code>onAsyncConfirm</code> silently skips the async one — which is the mistake
					this shape invites, and the reason it is written down on the type.
				</Callout>
				<Text size="sm" type="secondary">
					All three render through the one overlay primitive — the surface, modality and
					dismissal are documented in{" "}
					<TextLink href="#/overlay">Overlay, dialog &amp; sheet</TextLink>.
				</Text>
			</Example>

			<Example id="action-overlays-api" title="API">
				<PropTable owner="ActionDialog"
					rows={[
						{ name: "trigger / open", type: "ReactNode / boolean", description: "Supply one or the other. A trigger makes it uncontrolled; `open` hands the state to the caller." },
						{ name: "onConfirm / onAsyncConfirm / formId", type: "() => void / () => Promise<void> / string", description: "The three confirm paths, in precedence order. formId calls requestSubmit(), so native validation runs and the form's own onSubmit owns the outcome." },
						{ name: "onError", type: "(error: unknown) => void", description: "Receives a rejected async confirm. The overlay stays open." },
						{ name: "closeOnAsyncComplete", type: "boolean", default: "true", description: "Off keeps it open after a resolved async confirm — a multi-step flow." },
						{ name: "tone / emphasis / showIcon", type: "OverlayTone / boolean / boolean", description: "emphasis lets the tone drive the confirm button's colour as well as the glyph. Without it the tone is presentational — a warning-toned dialog whose action is just the action is a real combination." },
						{ name: "alertMessage", type: "ReactNode", description: "A notice between the header and the body, inside the scroll region — a warning pinned above it would stay while the thing it warns about scrolls away." },
						{ name: "footer", type: "ReactNode", description: "Replaces the generated footer. Every action prop stops applying." },
						{ name: "ActionSheet modality", type: '"modal" | "trap-focus" | "non-modal"', default: '"modal"', description: "How much of the page it takes hostage. A non-modal panel leaves the surrounding page interactive." },
						{ name: "ActionDialog width", type: '"sm" | "md" | "lg" | "xl" | "full" | CSS length', default: '"md"', description: "A dialog's max width is a real per-dialog decision — a confirmation is narrow and a form is wide." },
						{ name: "useOverlayVisibility", type: "(options) => { open, show, hide, toggle, overlayProps }", description: "One overlay's state, controlled or not. `overlayProps` spreads straight onto any overlay in the kit." },
						{ name: "useOverlayVisibilityGroup", type: "(keys, options) => Record<key, …>", description: "Several by name, with closeOthersOnOpen for a set where two open at once is never right." },
						{ name: "useOverlayVisibilityGroup", type: "hook", description: "One handle per overlay when a component drives several \u2014 create, edit, delete. Three separate useState calls is how two of them end up open at once." },
						{ name: "useOverlayActions", type: "hook", description: "The confirm button\u2019s behaviour \u2014 the pending state, the error routing, and the close on success \u2014 shared by the three overlays. For a bespoke surface that still needs that lifecycle." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
