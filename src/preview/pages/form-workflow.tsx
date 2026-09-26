import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FormWorkflowPage() {
	return (
		<ComponentPage>
			<Example
				example="form-workflow/form-section"
				title="FormSection"
				description="A titled group of fields, with room for controls on the title line and a footer under them. `surface=&quot;flat&quot;` drops the chrome for a section that already sits inside a card — which is most of them, and the reason the prop exists rather than a second component."
			/>

			<Example
				example="form-workflow/form-actions"
				title="FormActionsBar"
				description="The row a form ends on. `leading` carries status — a last-saved time, a count of unsaved changes — so the bar answers &quot;can I leave?&quot; as well as offering the way out. `sticky` pins it to the foot of its scrolling ancestor, for a form longer than the viewport."
			/>

			<Example
				example="form-workflow/form-error-summary"
				title="ErrorSummary"
				description="What a failed submission puts at the top of the form. It counts the problems in its own heading, because &quot;3 problems&quot; is the fact a reader needs before reading any of them — and it takes an action, so the summary can move focus to the first field rather than leaving the reader to hunt."
			/>

			<Example
				example="form-workflow/form-dirty"
				title="DirtyStateBanner"
				description="The banner a form shows while it holds unsaved work. Its tone is limited to neutral, info and warning on purpose — unsaved work is not an error and not a success, and letting it take `destructive` would make every half-finished form look broken."
			/>

			<Example
				example="form-workflow/form-submit-state"
				title="SubmitStateButton"
				description="A submit button that says what it is doing. The LABEL changes rather than the button vanishing behind a spinner, because &quot;Saving…&quot; is the answer to the question the reader is actually asking. It stays disabled while submitting, so a second click cannot double-submit."
			/>

			<Example
				example="form-workflow/form-states"
				title="LoadingState and ErrorState"
				description="What a region shows instead of its content. Both are regions, not overlays — they take the space the content would have taken, so nothing reflows when the data lands. ErrorState renders its retry control only when a retry is wired: without a handler there is nothing to offer, and a dead button is worse than none."
			/>

			<Example id="form-workflow-rule" title="Around the fields, not in them">
				<Callout label="Rule">
					These wrap a form; they do not validate one. Validation state belongs to{" "}
					<code>FormField</code>, which owns the label, the control and the message as one
					row. <code>ErrorSummary</code> repeats what the fields already say, at the top,
					because a reader who has scrolled past a failure has no other way to find it.
				</Callout>
			</Example>

			<Example id="form-workflow-api" title="API">
				<PropTable
					rows={[
						{ name: "FormSection title / description / actions / footer", type: "ReactNode", description: "The header line, the copy under it, controls on the title's own line, and a footer below the fields." },
						{ name: "FormSection surface", type: "CardSurface", description: 'Outer chrome. "flat" for a section already inside a card, which is most of them.' },
						{ name: "FormActionsBar leading / trailing / children", type: "ReactNode", description: "Status before the actions, and the actions themselves. trailing wins when both it and children are given." },
						{ name: "FormActionsBar sticky", type: "boolean", default: "false", description: "Pins the bar to the foot of its nearest scrolling ancestor, for a form longer than the viewport." },
						{ name: "ErrorSummary errors / action / title / description", type: "ReactNode[] / ReactNode", description: "The problems, and a control beside them. The heading counts the list unless a title replaces it." },
						{ name: "DirtyStateBanner tone", type: '"neutral" | "info" | "warning"', description: "Deliberately narrower than AlertTone: unsaved work is neither an error nor a success." },
						{ name: "SubmitStateButton state", type: '"idle" | "submitting" | "succeeded"', description: "Drives the label and the disabled state. The label is the message, so a spinner never replaces the answer." },
						{ name: "LoadingState label / strings", type: "ReactNode / Partial<LoadingStateStrings>", description: "Copy for the wait. A region, not an overlay — it occupies what the content will occupy." },
						{ name: "ErrorState onRetry / action", type: "() => void / ReactNode", description: "Wiring onRetry renders the retry control; action replaces it entirely. Neither, and the state states the failure without offering a dead button." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
