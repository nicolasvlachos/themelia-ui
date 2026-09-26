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
				<PropTable owners={["ActionDialog", "ActionSheet"]} />
				<PropTable symbols={["useOverlayVisibility", "useOverlayVisibilityGroup", "useOverlayActions"]} />
			</Example>
		</ComponentPage>
	)
}
