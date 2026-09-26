import { useState } from "react"

import { Button } from "@/components/base/buttons"
import {
	DirtyStateBanner, ErrorSummary, FormActionsBar, FormSection, SubmitStateButton,
	type SubmitState,
} from "@/components/base/forms"
import { ErrorState, LoadingState } from "@/components/base/feedback"
import { Input } from "@/components/base/text-inputs"
import { FormField } from "@/components/base/forms"
import { Card, CardContent } from "@/components/base/cards"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FormWorkflowPage() {
	const [state, setState] = useState<SubmitState>("idle")

	return (
		<ComponentPage
			title="Form workflow"
			summary="The parts a form needs around its fields: a titled section, the action bar at its foot, the summary that appears when submission fails, the banner that appears when it has unsaved work, and the submit button that says what it is doing. Beside them, the two states a region shows instead of content — loading and failed."
			importPath="@/components/base/forms"
			exports={[
				"FormSection", "FormActionsBar", "ErrorSummary", "DirtyStateBanner",
				"SubmitStateButton", "LoadingState", "ErrorState",
			]}
		>
			<Example
				id="form-section"
				title="FormSection"
				description="A titled group of fields, with room for controls on the title line and a footer under them. `surface=&quot;flat&quot;` drops the chrome for a section that already sits inside a card — which is most of them, and the reason the prop exists rather than a second component."
				stacked
				code={`<FormSection title="Billing" description="Where invoices go." actions={<Button>Edit</Button>}>
  <FormField label="Company">…</FormField>
</FormSection>`}
			>
				<Stack gap="xl" style={{ maxWidth: "34rem" }}>
					<FormSection
						title="Billing"
						description="Where invoices go. Changing it does not change the shipping address."
						actions={
							<Button tone="neutral" buttonStyle="ghost">
								Edit
							</Button>
						}
						footer={
							<Text size="xs" type="secondary">
								VAT is added at checkout.
							</Text>
						}
					>
						<FormField label="Company">
							<Input defaultValue="Northwind Traders" />
						</FormField>
					</FormSection>
				</Stack>
			</Example>

			<Example
				id="form-actions"
				title="FormActionsBar"
				description="The row a form ends on. `leading` carries status — a last-saved time, a count of unsaved changes — so the bar answers &quot;can I leave?&quot; as well as offering the way out. `sticky` pins it to the foot of its scrolling ancestor, for a form longer than the viewport."
				stacked
				code={`<FormActionsBar leading={<Text size="xs" type="secondary">Saved 2 minutes ago</Text>}>
  <Button buttonStyle="outline">Discard</Button>
  <Button>Save</Button>
</FormActionsBar>`}
			>
				<Card style={{ maxWidth: "34rem" }}>
					<CardContent>
						<FormActionsBar
							leading={
								<Text size="xs" type="secondary">
									Saved 2 minutes ago
								</Text>
							}
						>
							<Button tone="neutral" buttonStyle="outline">
								Discard
							</Button>
							<Button>Save</Button>
						</FormActionsBar>
					</CardContent>
				</Card>
			</Example>

			<Example
				id="form-error-summary"
				title="ErrorSummary"
				description="What a failed submission puts at the top of the form. It counts the problems in its own heading, because &quot;3 problems&quot; is the fact a reader needs before reading any of them — and it takes an action, so the summary can move focus to the first field rather than leaving the reader to hunt."
				stacked
				code={`<ErrorSummary
  errors={["Name is required.", "Email is not valid."]}
  action={<Button buttonStyle="outline">Review the first problem</Button>}
/>`}
			>
				<Stack style={{ maxWidth: "34rem" }}>
					<ErrorSummary
						errors={[
							"Name is required.",
							"Email is not valid.",
							"VAT number does not match the selected country.",
						]}
						action={
							<Button tone="neutral" buttonStyle="outline">
								Review the first problem
							</Button>
						}
					/>
				</Stack>
			</Example>

			<Example
				id="form-dirty"
				title="DirtyStateBanner"
				description="The banner a form shows while it holds unsaved work. Its tone is limited to neutral, info and warning on purpose — unsaved work is not an error and not a success, and letting it take `destructive` would make every half-finished form look broken."
				stacked
				code={`<DirtyStateBanner actions={<><Button buttonStyle="outline">Discard</Button><Button>Save</Button></>} />`}
			>
				<Stack gap="lg" style={{ maxWidth: "34rem" }}>
					{(["neutral", "info", "warning"] as const).map((tone) => (
						<DirtyStateBanner
							key={tone}
							tone={tone}
							actions={
								<>
									<Button tone="neutral" buttonStyle="outline">
										Discard
									</Button>
									<Button>Save</Button>
								</>
							}
						/>
					))}
				</Stack>
			</Example>

			<Example
				id="form-submit-state"
				title="SubmitStateButton"
				description="A submit button that says what it is doing. The LABEL changes rather than the button vanishing behind a spinner, because &quot;Saving…&quot; is the answer to the question the reader is actually asking. It stays disabled while submitting, so a second click cannot double-submit."
				stacked
				code={`<SubmitStateButton state={state} />`}
			>
				<Stack direction="horizontal" gap="lg" wrap align="center">
					{(["idle", "submitting", "succeeded"] as SubmitState[]).map((s) => (
						<SubmitStateButton key={s} state={s} />
					))}
					<Button
						tone="neutral"
						buttonStyle="outline"
						onClick={() => {
							setState("submitting")
							setTimeout(() => setState("succeeded"), 1200)
							setTimeout(() => setState("idle"), 2600)
						}}
					>
						Run the cycle
					</Button>
					<SubmitStateButton state={state} />
				</Stack>
			</Example>

			<Example
				id="form-states"
				title="LoadingState and ErrorState"
				description="What a region shows instead of its content. Both are regions, not overlays — they take the space the content would have taken, so nothing reflows when the data lands. ErrorState renders its retry control only when a retry is wired: without a handler there is nothing to offer, and a dead button is worse than none."
				stacked
				code={`<LoadingState />
<ErrorState onRetry={refetch} />`}
			>
				<Stack gap="lg">
					<Card>
						<CardContent>
							<LoadingState />
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<ErrorState onRetry={() => {}} />
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<ErrorState
								title="That report is no longer available"
								description="It was scheduled for deletion after 90 days."
							/>
						</CardContent>
					</Card>
				</Stack>
			</Example>

			<Example id="form-workflow-rule" title="Around the fields, not in them" stacked>
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
