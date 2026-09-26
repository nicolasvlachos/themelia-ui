import { useState } from "react"

import { Button } from "@/components/base/buttons"
import { FormField } from "@/components/base/forms"
import { Input } from "@/components/base/text-inputs"
import { Stack } from "@/components/base/structure"
import { Text, TextLink } from "@/components/base/typography"
import { ActionDialog, ActionSheet, ConfirmDialog, useOverlayVisibilityGroup } from "@/components/features"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function ActionOverlaysPage() {
	const [saved, setSaved] = useState<string | null>(null)
	const [failure, setFailure] = useState<string | null>(null)
	const overlays = useOverlayVisibilityGroup(["edit", "remove"] as const, {
		closeOthersOnOpen: true,
	})

	return (
		<ComponentPage
			title="Action overlays"
			summary="A dialog, a sheet, and a confirmation with their footers generated. The primitives own the surface; these own the part every screen otherwise rebuilds — two buttons in a fixed order, and a confirm that knows about async work and forms."
			importPath="@/components/features/overlays"
			exports={["ActionDialog", "ActionSheet", "ConfirmDialog", "useOverlayVisibility",
				"useOverlayVisibilityGroup", "useOverlayActions",
			]}
		>
			<Example
				id="action-dialog"
				title="ActionDialog"
				description="A dialog plus the footer. Cancel is first in the DOM and on the left, confirm last and on the right — fixed, not configurable, because the confirm is the one a reader reaches for without looking and a screen where it moves is a screen where they press cancel."
				code={`<ActionDialog
  title="Rename workspace"
  trigger={<Button>Rename</Button>}
  onConfirm={save}
/>`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					<ActionDialog
						title="Rename workspace"
						description="The name appears in the sidebar and in invitations."
						trigger={<Button tone="neutral" buttonStyle="outline">Plain</Button>}
						onConfirm={() => setSaved("renamed")}
					>
						<FormField label="Name">
							<Input defaultValue="Northwind Traders" />
						</FormField>
					</ActionDialog>

					<ActionDialog
						title="Publish this release?"
						description="It becomes visible to every workspace member."
						tone="warning"
						emphasis
						showIcon
						alertMessage="Members are notified by email as soon as it publishes."
						trigger={<Button tone="neutral" buttonStyle="outline">Toned</Button>}
						onConfirm={() => setSaved("published")}
					/>

					<ActionDialog
						title="Saving takes a moment"
						description="The confirm shows a spinner and both buttons disable until it settles."
						trigger={<Button tone="neutral" buttonStyle="outline">Async confirm</Button>}
						onAsyncConfirm={async () => {
							await wait(1200)
							setSaved("saved after a delay")
						}}
					/>

					<ActionDialog
						title="This one fails"
						alertMessage={failure}
						tone="destructive"
						onOpenChange={() => setFailure(null)}
						description="A rejection leaves the overlay open and reports through onError — closing it would take the form away at the moment you most need to see what went wrong."
						trigger={<Button tone="neutral" buttonStyle="outline">Async that rejects</Button>}
						onAsyncConfirm={async () => {
							await wait(900)
							throw new Error("Could not reach the server")
						}}
						onError={(error) => { setFailure((error as Error).message); setSaved(`failed: ${(error as Error).message}`) }}
					/>
				</Stack>
				{!!saved && (
					<Text size="sm" type="secondary">
						last result: {saved}
					</Text>
				)}
			</Example>

			<Example
				id="confirm-dialog"
				title="ConfirmDialog"
				description="A question and two answers, over the alert dialog — the primitive with both dismissal routes off, because a stray click outside is not an answer. It says “Continue”, not “Confirm”: the button is read as the answer to the question the title just asked."
				code={`<ConfirmDialog
  destructive
  title="Delete this invoice?"
  description="This cannot be undone."
  trigger={<Button tone="destructive">Delete</Button>}
  onAsyncConfirm={remove}
/>`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					<ConfirmDialog
						title="Discard your changes?"
						description="The draft has unsaved edits."
						trigger={<Button tone="neutral" buttonStyle="outline">Neutral</Button>}
					/>
					<ConfirmDialog
						destructive
						title="Delete this invoice?"
						description="INV-4417 will be removed from the workspace."
						alertMessage="This cannot be undone."
						trigger={<Button tone="destructive">Destructive</Button>}
						onAsyncConfirm={() => wait(900)}
					/>
				</Stack>
			</Example>

			<Example
				id="action-sheet"
				title="ActionSheet"
				description="The same recipe on an edge panel, for work longer than a dialog holds. modality is the interesting prop: an inspector or a filter rail exists to sit beside the app while you keep working, which is non-modal — the page remains interactive, so use a modal confirmation for a question that must be answered."
				code={`<ActionSheet
  side="inline-end"
  title="Filters"
  modality="non-modal"
  trigger={<Button>Filter</Button>}
/>`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					<ActionSheet
						title="Edit invoice"
						description="Longer work than a dialog comfortably holds."
						trigger={<Button tone="neutral" buttonStyle="outline">Modal sheet</Button>}
						onAsyncConfirm={() => wait(700)}
					>
						<Stack gap="md">
							<FormField label="Reference">
								<Input defaultValue="INV-4417" />
							</FormField>
							<FormField label="Customer">
								<Input defaultValue="Northwind Traders" />
							</FormField>
						</Stack>
					</ActionSheet>

					<ActionSheet
						title="Filters"
						description="The page stays interactive behind it."
						modality="non-modal"
						showFooter={false}
						inset
						trigger={<Button tone="neutral" buttonStyle="outline">Non-modal inspector</Button>}
					>
						<Text size="sm" type="secondary">
							Scroll and click the page behind this panel — it is not inert.
						</Text>
					</ActionSheet>
				</Stack>
			</Example>

			<Example
				id="overlay-visibility"
				title="Driving them from elsewhere"
				description="An overlay is uncontrolled while it hangs off its own trigger and controlled the moment something else opens it — a row action, a route, a shortcut. useOverlayVisibilityGroup keys several by name, and closeOthersOnOpen is what stops the second landing on top of the first."
				stacked
				code={`const overlays = useOverlayVisibilityGroup(["edit", "remove"], {
  closeOthersOnOpen: true,
})

<Button onClick={overlays.edit.show}>Edit</Button>
<ActionDialog {...overlays.edit.overlayProps} title="Edit" />`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					<Button tone="neutral" buttonStyle="outline" onClick={overlays.edit.show}>
						Open edit
					</Button>
					<Button tone="neutral" buttonStyle="outline" onClick={overlays.remove.show}>
						Open remove
					</Button>
				</Stack>

				<ActionDialog
					{...overlays.edit.overlayProps}
					title="Edit"
					description="Opened from the button beside this one, not from a trigger."
				/>
				<ConfirmDialog
					{...overlays.remove.overlayProps}
					destructive
					title="Remove?"
					description="Opening this one closes the other — closeOthersOnOpen."
				/>
			</Example>

			<Example id="overlays-rule" title="Which confirm path runs" stacked>
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
