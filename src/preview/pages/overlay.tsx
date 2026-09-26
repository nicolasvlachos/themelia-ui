import { useId, useRef, useState } from "react"

import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import {
	AlertDialogAction, AlertDialogCancel, AlertDialogContent,
} from "@/components/base/alert-dialog"
import { Button, TooltipButton } from "@/components/base/buttons"
import { Select } from "@/components/base/choice-inputs"
import { DialogContent } from "@/components/base/dialog"
import { FormField } from "@/components/base/forms"
import {
	Overlay, OverlayBody, OverlayClose, OverlayContent, OverlayDescription, OverlayDismissArea,
	OverlayFooter, OverlayHeader, OverlayTitle, OverlayTrigger,
	type OverlayPlacement,
} from "@/components/base/overlay"
import { SheetContent } from "@/components/base/sheet"
import { Stack } from "@/components/base/structure"
import { Input } from "@/components/base/text-inputs"
import { Text, TextLink } from "@/components/base/typography"
import { UIProvider } from "@/lib/ui-provider"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const ROLES = [
	{ value: "viewer", label: "Viewer" },
	{ value: "member", label: "Member" },
	{ value: "admin", label: "Admin" },
	{ value: "owner", label: "Owner" },
]

const INVITE_ACTIONS: ActionDefinition[] = [
	{ label: "Invite several people", onClick: () => {} },
	{ label: "Import from a CSV", onClick: () => {} },
	{ label: "Invite settings", onClick: () => {}, group: true },
]

/** One demo surface, so each example differs only by the settings it is showing. */
function Demo({
	label,
	...content
}: { label: string } & React.ComponentProps<typeof OverlayContent>) {
	const id = useId()
	return (
		<Overlay>
			<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
				{label}
			</OverlayTrigger>
			<OverlayContent aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} {...content}>
				<OverlayHeader>
					<OverlayTitle id={`${id}-title`}>{label}</OverlayTitle>
					<OverlayDescription id={`${id}-description`}>
						The same surface every time. Only placement, size, modality and dismissal differ.
					</OverlayDescription>
				</OverlayHeader>
				<OverlayBody>
					<Text size="xs" type="secondary">
						Built on the native &lt;dialog&gt;, so the browser supplies the top layer, the
						backdrop, the focus trap, Escape, the inert background and focus restore. None of
						that is re-implemented here, which is why there is one surface rather than four.
					</Text>
				</OverlayBody>
				<OverlayFooter>
					<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
						Close
					</OverlayClose>
				</OverlayFooter>
			</OverlayContent>
		</Overlay>
	)
}

export function OverlayPage() {
	const [open, setOpen] = useState(false)
	const [nonModal, setNonModal] = useState(false)
	const nameRef = useRef<HTMLInputElement>(null)

	return (
		<ComponentPage
			title="Overlay"
			summary="The one modal surface in the kit, and the only page about it. Dialog, alert dialog and sheet are not separate components: each is this surface with some of its settings filled in and a name that says why. DialogContent is OverlayContent with placement=“center”. AlertDialogContent is a centred surface that nothing dismisses but an answer, given with AlertDialogAction or AlertDialogCancel. SheetContent is OverlayContent at an edge. Those are the parts that set something; the root, trigger, close, body, title and description around them are always Overlay's own. Learn the settings once here; use a preset when its name says what you mean, and configure OverlayContent for a combination no preset names."
			importPath="@/components/base/overlay"
			exports={[
				"Overlay", "OverlayTrigger", "OverlayContent", "OverlayClose", "OverlayHeader",
				"OverlayBody", "OverlayFooter", "OverlayTitle", "OverlayDescription",
				"OverlayDismissArea",
			]}
			alsoImports={[
				{ importPath: "@/components/base/dialog", title: "Dialog", exports: ["DialogContent"] },
				{ importPath: "@/components/base/alert-dialog", title: "Alert dialog", exports: ["AlertDialogContent", "AlertDialogAction", "AlertDialogCancel", "AlertDialogMedia"] },
				{ importPath: "@/components/base/sheet", title: "Sheet", exports: ["SheetContent"] },
			]}
		>
			<Example
				id="overlay-placement"
				title="placement"
				description="Centre reads as a dialog; an edge reads as a sheet or a drawer. The word is the only difference between them — there is no second component for the edge case. DialogContent is this setting fixed at centre, and SheetContent is this setting at an edge with a default shape."
				stacked
				code={`<Overlay>
  <OverlayTrigger render={<Button>Open</Button>} />
  <OverlayContent placement="inline-end">
    <OverlayHeader>…</OverlayHeader>
    <OverlayBody>…</OverlayBody>
  </OverlayContent>
</Overlay>`}
			>
				<Stack direction="horizontal" gap="md" wrap>
					{(
						["center", "inline-start", "inline-end", "block-start", "block-end"] as OverlayPlacement[]
					).map((placement) => (
						<Demo key={placement} label={placement} placement={placement} />
					))}
				</Stack>
			</Example>

			<Example
				id="modality"
				title="modality"
				description="How much of the page the surface takes hostage. `modal`, the default, traps focus, dims the page and locks its scroll. `trap-focus` keeps focus inside but leaves the page scrollable and clickable. `non-modal` drops the scrim, the trap and the scroll lock — for an inspector you work beside rather than answer."
				code={`<OverlayContent placement="inline-end" modality="non-modal" />

{/* the same, as the preset */}
<SheetContent modality="non-modal" />`}
			>
				<Button tone="neutral" buttonStyle="outline" onClick={() => setNonModal(true)}>
					Open non-modal
				</Button>
				<Text type="secondary" size="sm">
					The page stays scrollable and interactive while it is open.
				</Text>
				<Overlay open={nonModal} onOpenChange={setNonModal}>
					<OverlayContent placement="inline-end" modality="non-modal">
						<OverlayHeader>
							<OverlayTitle>Inspector</OverlayTitle>
							<OverlayDescription>No scrim, no scroll lock.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">Scroll the page behind; this stays where it is.</Text>
						</OverlayBody>
						<OverlayFooter>
							<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
								Close
							</OverlayClose>
						</OverlayFooter>
					</OverlayContent>
				</Overlay>
			</Example>

			<Example
				id="overlay-dismissal"
				title="dismissal"
				description="Both routes out are separately switchable. A decision the reader must answer turns off the backdrop; destructive or in-progress work turns off Escape. Turning both off leaves the footer's own control as the only way out, which is a deliberate choice and not a default — it is the one AlertDialogContent makes."
				stacked
				code={`<OverlayContent dismissal={{ backdrop: false, escape: false }} />`}
			>
				<Stack direction="horizontal" gap="md" wrap>
					<Demo label="no backdrop dismiss" dismissal={{ backdrop: false }} />
					<Demo label="no escape" dismissal={{ escape: false }} />
				</Stack>
			</Example>

			<Example
				id="overlay-controlled"
				title="Controlled"
				description="`open` and `onOpenChange` on the root, for a surface opened by something other than its own trigger — a row action, a keyboard shortcut, a route."
				stacked
				code={`<Overlay open={open} onOpenChange={setOpen}>
  <OverlayContent>…</OverlayContent>
</Overlay>`}
			>
				<Stack direction="horizontal" gap="md" align="center">
					<Button tone="neutral" buttonStyle="outline" onClick={() => setOpen(true)}>
						Open from outside
					</Button>
					<Text size="xs" type="secondary">
						open: {String(open)}
					</Text>
					<Overlay open={open} onOpenChange={setOpen}>
						<OverlayContent>
							<OverlayHeader>
								<OverlayTitle>Controlled</OverlayTitle>
								<OverlayDescription>The caller owns the open state.</OverlayDescription>
							</OverlayHeader>
							<OverlayFooter>
								<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
									Close
								</OverlayClose>
							</OverlayFooter>
						</OverlayContent>
					</Overlay>
				</Stack>
			</Example>

			<Example
				id="overlay-structure"
				title="Header, body and footer"
				description="A flush shell with three regions. Header and footer hold their edges and the body owns the scroll, so a long surface never scrolls its own title or its buttons away. Every preset below is this structure."
				code={`<Overlay>
  <OverlayTrigger render={<Button>Open</Button>} />
  <OverlayContent>
    <OverlayHeader><OverlayTitle>Title</OverlayTitle></OverlayHeader>
    <OverlayBody>…</OverlayBody>
    <OverlayFooter>
      <OverlayDismissArea>
        <Button>Cancel</Button><Button>Save</Button>
      </OverlayDismissArea>
    </OverlayFooter>
  </OverlayContent>
</Overlay>

{/* or per action, when only some of them close: */}
<OverlayClose render={<Button>Cancel</Button>} />`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Open a long surface
					</OverlayTrigger>
					<OverlayContent>
						<OverlayHeader>
							<OverlayTitle>Structured anatomy</OverlayTitle>
							<OverlayDescription>Header and footer are fixed; the body scrolls.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							{Array.from({ length: 30 }, (_, i) => (
								<Text key={i}>Body line {i + 1}.</Text>
							))}
						</OverlayBody>
						<OverlayFooter>
							<OverlayDismissArea>
								<Button tone="neutral" buttonStyle="outline">Cancel</Button>
								<Button>Save</Button>
							</OverlayDismissArea>
						</OverlayFooter>
					</OverlayContent>
				</Overlay>
			</Example>

			<Example
				id="dialog-surface"
				title="Bare surface"
				description="No region dividers and no corner control. For a short decision whose two buttons are the whole interface — a framed shell around four lines of text is chrome around nothing."
				code={`<OverlayContent surface="bare" showCloseButton={false}>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Confirm
					</OverlayTrigger>
					<OverlayContent surface="bare" showCloseButton={false}>
						<OverlayHeader>
							<OverlayTitle>Publish this release?</OverlayTitle>
							<OverlayDescription>It becomes visible to every workspace member.</OverlayDescription>
						</OverlayHeader>
						<OverlayFooter>
							<OverlayDismissArea>
								<Button tone="neutral" buttonStyle="outline">Cancel</Button>
								<Button>Publish</Button>
							</OverlayDismissArea>
						</OverlayFooter>
					</OverlayContent>
				</Overlay>
			</Example>

			<Example
				id="dialog-focus"
				title="Where focus lands"
				description="Focus goes to the first tabbable node in the surface, and the corner dismiss comes last in the DOM, so it is never the one. initialFocusRef names the target explicitly — here the field the surface was opened to fill in — so reordering the body cannot move it."
				code={`const nameRef = useRef<HTMLInputElement>(null)\n\n<OverlayContent initialFocusRef={nameRef}>\n  <Input ref={nameRef} />\n</OverlayContent>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						New workspace
					</OverlayTrigger>
					<OverlayContent initialFocusRef={nameRef}>
						<OverlayHeader>
							<OverlayTitle>New workspace</OverlayTitle>
						</OverlayHeader>
						<OverlayBody>
							<Stack gap="md">
								<FormField label="Name">
									<Input ref={nameRef} placeholder="Acme design" />
								</FormField>
								<FormField label="Slug" hint="Used in URLs.">
									<Input placeholder="acme-design" />
								</FormField>
							</Stack>
						</OverlayBody>
						<OverlayFooter>
							<OverlayDismissArea>
								<Button tone="neutral" buttonStyle="outline">Cancel</Button>
								<Button>Create</Button>
							</OverlayDismissArea>
						</OverlayFooter>
					</OverlayContent>
				</Overlay>
			</Example>

			<Example
				id="dialog-popups"
				title="Popups inside an overlay"
				description="A modal overlay lives in the browser's top layer and makes the rest of the page inert, so a menu or select portalled to the body would paint underneath it and ignore every click. The overlay hosts its own portal target, so popups opened inside it render inside it — stacked above it, reachable by keyboard, and closed one layer at a time by Escape. The same holds in every preset."
				code={`<OverlayContent>\n  <OverlayBody>\n    <Select options={roles} />\n    <ActionMenu actions={actions} />\n  </OverlayBody>\n</OverlayContent>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Invite member
					</OverlayTrigger>
					<OverlayContent>
						<OverlayHeader>
							<OverlayTitle>Invite member</OverlayTitle>
							<OverlayDescription>They receive an email with a link to join.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Stack gap="md">
								<FormField label="Email">
									<Input placeholder="name@example.com" />
								</FormField>
								<FormField label="Role" hint="Admins can manage billing.">
									<Select options={ROLES} defaultValue="member" />
								</FormField>
							</Stack>
						</OverlayBody>
						<OverlayFooter>
							<Stack direction="horizontal" gap="md" align="center" wrap>
								<ActionMenu actions={INVITE_ACTIONS} label="More" />
								<TooltipButton tooltip="Copy an invite link instead" tone="neutral" buttonStyle="ghost">
									Copy link
								</TooltipButton>
								<OverlayDismissArea>
									<Button tone="neutral" buttonStyle="outline">Cancel</Button>
									<Button>Send invite</Button>
								</OverlayDismissArea>
							</Stack>
						</OverlayFooter>
					</OverlayContent>
				</Overlay>
			</Example>

			<Example id="overlay-rule" title="Three presets, one surface" stacked>
				<Callout label="Rule">
					A preset is a content part, not a second implementation: it is{" "}
					<code>OverlayContent</code> with settings filled in, placed inside Overlay's own
					root beside Overlay's trigger, and holding Overlay's title, description, body and
					close. A preset family exports only the parts that set something. Use one when its
					name says what you mean — <code>&lt;AlertDialogContent&gt;</code> tells the next
					reader more than a <code>dismissal</code> object does. For a combination none of
					them names, configure <code>OverlayContent</code> rather than building a fourth modal.
				</Callout>
				<Text size="sm" type="secondary">
					<strong>DialogContent</strong> fixes <code>placement="center"</code> and nothing
					else. Reach for it for a task done in the middle of the page and then left: a short
					form, a picker, a decision that can be cancelled.
				</Text>
				<Text size="sm" type="secondary">
					<strong>AlertDialogContent</strong> fixes the centre too, then turns off every way out
					but an answer — no backdrop, no Escape, no corner close — and announces as{" "}
					<code>alertdialog</code>. <code>AlertDialogAction</code> and{" "}
					<code>AlertDialogCancel</code> are the answers. Reach for it when a stray click must
					not decide: deleting, discarding, anything that cannot be undone.
				</Text>
				<Text size="sm" type="secondary">
					<strong>SheetContent</strong> fixes an edge, named <code>side</code>, and a default
					shape a product can change once on the provider. Reach for it for work that sits
					beside the page: an inspector, a filter rail, a record edited while its list stays
					in view.
				</Text>
				<Text size="sm" type="secondary">
					When the footer is always the same — cancel, confirm, perhaps an async save — the
					features layer generates it: <TextLink href="#/action-overlays">Action overlays</TextLink>{" "}
					are ActionDialog, ActionSheet and ConfirmDialog, and they render through this same
					surface.
				</Text>
			</Example>

			<Example
				id="dialog"
				title="Dialog"
				description={'DialogContent is OverlayContent with `placement="center"` filled in, and that is the whole of the dialog. The root, trigger, close, header, body, footer, title and description are Overlay\'s own parts, imported under their own names — so everything above applies unchanged.'}
				code={`<Overlay>
  <OverlayTrigger render={<Button>Rename</Button>} />
  <DialogContent>
    <OverlayHeader><OverlayTitle>Rename project</OverlayTitle></OverlayHeader>
    <OverlayBody>…</OverlayBody>
    <OverlayFooter>
      <OverlayClose render={<Button>Cancel</Button>} />
      <OverlayClose render={<Button>Save</Button>} />
    </OverlayFooter>
  </DialogContent>
</Overlay>

{/* DialogContent is exactly */}
<OverlayContent placement="center">…</OverlayContent>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Open dialog
					</OverlayTrigger>
					<DialogContent>
						<OverlayHeader>
							<OverlayTitle>Rename project</OverlayTitle>
							<OverlayDescription>The new name shows everywhere the project is listed.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<FormField label="Project name">
								<Input defaultValue="Spring launch" />
							</FormField>
						</OverlayBody>
						<OverlayFooter>
							<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
								Cancel
							</OverlayClose>
							<OverlayClose render={<Button />}>
								Save
							</OverlayClose>
						</OverlayFooter>
					</DialogContent>
				</Overlay>
			</Example>

			<Example
				id="alert-dialog"
				title="Alert dialog"
				description="The same centred surface with both dismissal routes off, no corner close, and role=alertdialog: the backdrop and Escape do not decide for the reader. Nothing closes it but an answer — which is the whole difference from a dialog, so the two cannot drift in shell, header, footer or scrolling."
				code={`<Overlay>
  <OverlayTrigger render={<Button tone="destructive">Delete account</Button>} />
  <AlertDialogContent>
    <OverlayHeader><OverlayTitle>Delete this account?</OverlayTitle></OverlayHeader>
    <OverlayFooter>
      <AlertDialogCancel render={<Button tone="neutral" buttonStyle="outline" />}>Cancel</AlertDialogCancel>
      <AlertDialogAction render={<Button tone="destructive" />}>Delete</AlertDialogAction>
    </OverlayFooter>
  </AlertDialogContent>
</Overlay>

{/* AlertDialogContent is exactly */}
<OverlayContent
  role="alertdialog"
  dismissal={{ backdrop: false, escape: false }}
  showCloseButton={false}
/>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="destructive" buttonStyle="outline" />}>
						Delete account
					</OverlayTrigger>
					<AlertDialogContent>
						<OverlayHeader>
							<OverlayTitle>Delete this account?</OverlayTitle>
							<OverlayDescription>This cannot be undone.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">Every project and invoice is removed permanently.</Text>
						</OverlayBody>
						<OverlayFooter>
							<AlertDialogCancel render={<Button tone="neutral" buttonStyle="outline" />}>
								Cancel
							</AlertDialogCancel>
							{/* The answer is an Action, not a second Cancel: they read the same only until a caller hooks the one that commits. */}
							<AlertDialogAction render={<Button tone="destructive" />}>
								Delete
							</AlertDialogAction>
						</OverlayFooter>
					</AlertDialogContent>
				</Overlay>
			</Example>

			<Example id="alert-dialog-rule" title="An alert dialog cannot be dismissed by accident" stacked>
				<Callout label="Rule">
					An alert dialog turns off backdrop and Escape dismissal. Every other overlay
					leaves both on — but this one exists precisely because the answer matters, and
					a stray click outside is not an answer.
				</Callout>
			</Example>

			<Example
				id="sheet"
				title="Sheet"
				description={'SheetContent is OverlayContent at an edge. `side` is `placement` under the name a panel is read by, and it adds a default shape — flush, full length, `size="md"` — that the provider can change once. Everything else, header and footer included, is Overlay\'s own part. The sides span the viewport; top and bottom size to their content.'}
				code={`<Overlay>
  <OverlayTrigger render={<Button>Edit</Button>} />
  <SheetContent side="inline-end">
    <OverlayHeader><OverlayTitle>Edit booking</OverlayTitle></OverlayHeader>
    <OverlayBody>…</OverlayBody>
    <OverlayFooter>
      <OverlayClose render={<Button>Cancel</Button>} />
      <OverlayClose render={<Button>Save</Button>} />
    </OverlayFooter>
  </SheetContent>
</Overlay>

{/* SheetContent is exactly */}
<OverlayContent placement="inline-end" size="md" length="full" inset={false}>…</OverlayContent>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Open sheet
					</OverlayTrigger>
					<SheetContent side="inline-end">
						<OverlayHeader>
							<OverlayTitle>Edit booking</OverlayTitle>
							<OverlayDescription>Native top layer — the list behind stays in view and cannot clip it.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Stack gap="md">
								<FormField label="Venue">
									<Input defaultValue="Marlow Hall" />
								</FormField>
								<FormField label="Guests">
									<Input defaultValue="120" inputMode="numeric" />
								</FormField>
							</Stack>
						</OverlayBody>
						<OverlayFooter>
							<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
								Cancel
							</OverlayClose>
							<OverlayClose render={<Button />}>
								Save
							</OverlayClose>
						</OverlayFooter>
					</SheetContent>
				</Overlay>
			</Example>

			<Example
				id="sheet-shape"
				title="Size, length, and inset"
				description="Three measurements, because they answer three questions. size is how much of the CROSS axis it takes — a side panel's width. inset is the gap from the viewport, and ONE offset covers every side the panel does not run to, so a corner-anchored panel needs nothing else. length shortens it further, as a fraction of the space the inset leaves rather than of the viewport, and the remainder is split between the two ends. All three are OverlayContent props; SheetContent only gives them defaults."
				code={`{/* the default: welded to the edge */}
<SheetContent side="inline-end" size="md" />

{/* a tall dialog from the corner — the offset is the whole shape */}
<SheetContent side="inline-end" size="28rem" inset />

{/* shorter still, centred in what the offset left */}
<SheetContent side="inline-end" size="28rem" length="70%" inset />`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Flush, size=&quot;sm&quot;
					</OverlayTrigger>
					<SheetContent side="inline-end" size="sm">
						<OverlayHeader>
							<OverlayTitle>Flush</OverlayTitle>
							<OverlayDescription>Welded to the edge, square outer corners.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">What a sheet has always been.</Text>
						</OverlayBody>
					</SheetContent>
				</Overlay>

				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Inset
					</OverlayTrigger>
					<SheetContent side="inline-end" size="28rem" inset>
						<OverlayHeader>
							<OverlayTitle>Corner-anchored</OverlayTitle>
							<OverlayDescription>
								Detached by one offset on all three sides, so the page shows past it.
							</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">
								The main view is still there — that is the point of the shape.
							</Text>
						</OverlayBody>
					</SheetContent>
				</Overlay>

				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Inset from block-end
					</OverlayTrigger>
					<SheetContent side="block-end" size="60%" length="70%" inset="1.5rem">
						<OverlayHeader>
							<OverlayTitle>From the bottom</OverlayTitle>
							<OverlayDescription>
								size caps the height here and length sets the width — the two swap axes
								with the side.
							</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">
								A bottom sheet sizes to its content, so <code>size</code> is a ceiling rather
								than a height — that is what keeps a short one from being a tall empty box.
							</Text>
						</OverlayBody>
					</SheetContent>
				</Overlay>
			</Example>

			<Example
				id="sheet-provider"
				title="Decided once, not per call site"
				description="A product that wants every panel corner-anchored says so on the provider. Both sheets below are written the same way — the scoped one inherits the shape. Repeating three props at every call site is how the fourth one ends up different."
				code={`<UIProvider config={{ defaults: { sheet: { size: "26rem", inset: true } } }}>
  <App />
</UIProvider>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Kit default
					</OverlayTrigger>
					<SheetContent>
						<OverlayHeader>
							<OverlayTitle>Kit default</OverlayTitle>
							<OverlayDescription>Flush, three-quarters wide.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">No shape props at the call site.</Text>
						</OverlayBody>
					</SheetContent>
				</Overlay>

				<UIProvider config={{ defaults: { sheet: { size: "26rem", inset: true } } }}>
					<Overlay>
						<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
							Under a provider
						</OverlayTrigger>
						<SheetContent>
							<OverlayHeader>
								<OverlayTitle>Under a provider</OverlayTitle>
								<OverlayDescription>The same JSX, a different shape — one offset, spent equally on all three sides.</OverlayDescription>
							</OverlayHeader>
							<OverlayBody>
								<Text type="secondary">Decided once for the whole product.</Text>
							</OverlayBody>
						</SheetContent>
					</Overlay>
				</UIProvider>
			</Example>

			<Example
				id="overlay-backdrop"
				title="A blurred scrim, when a product wants one"
				description="The scrim is a tint and nothing else by default: a backdrop blur re-rasterises everything behind the surface on every frame, and it measurably slowed dismissal. A product that wants the frosted look — and can pay for it — asks once on the provider, and every modal inside picks it up."
				code={`<UIProvider config={{ overlay: { backdropBlur: 4 } }}>
  <App />
</UIProvider>`}
			>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						Default scrim
					</OverlayTrigger>
					<DialogContent>
						<OverlayHeader>
							<OverlayTitle>Default scrim</OverlayTitle>
							<OverlayDescription>A tint only — the page behind stays sharp.</OverlayDescription>
						</OverlayHeader>
					</DialogContent>
				</Overlay>

				<UIProvider config={{ overlay: { backdropBlur: 4 } }}>
					<Overlay>
						<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
							Blurred scrim
						</OverlayTrigger>
						<DialogContent>
							<OverlayHeader>
								<OverlayTitle>Blurred scrim</OverlayTitle>
								<OverlayDescription>The same dialog under a provider that asks for a 4px blur.</OverlayDescription>
							</OverlayHeader>
						</DialogContent>
					</Overlay>
				</UIProvider>
			</Example>

			<Example id="overlay-api" title="Overlay API">
				<PropTable
					rows={[
						{ name: "Overlay open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled and uncontrolled open state on the root." },
						{ name: "overlay.backdropBlur", api: "@/lib/ui-provider#UIConfig.overlay.backdropBlur", type: "number | string", default: "none", description: "On UIProvider: a blur behind every modal scrim in its scope, in px or any CSS length. Off unless asked — a blur costs every frame the surface is open." },
						{ name: "OverlayContent placement", type: '"center" | "inline-start" | "inline-end" | "block-start" | "block-end"', default: '"center"', description: "Where the surface sits. Centre reads as a dialog, an edge as a sheet. DialogContent and AlertDialogContent fix it to centre; SheetContent exposes it as side." },
						{ name: "OverlayContent size", type: '"sm" | "md" | "lg" | "full" | string', description: "Cross-axis extent for an edge placement — the width of a side panel. Named steps resolve to tokens; any other CSS length is used as given. Ignored when centred." },
						{ name: "OverlayContent length", type: '"full" | string', default: '"full"', description: "Along-axis extent. Less than full detaches the panel and centres it on that axis." },
						{ name: "OverlayContent inset", type: "boolean | string", default: "false", description: "The gap to the viewport edges. false is flush — a sheet welded to the side. true uses the kit's gap; any CSS length sets your own." },
						{ name: "OverlayContent modality", type: '"modal" | "trap-focus" | "non-modal"', default: '"modal"', description: "How much of the page the surface takes hostage: scrim, inert background and scroll lock, or focus alone, or neither." },
						{ name: "OverlayContent dismissal", type: "{ backdrop?: boolean; escape?: boolean }", default: "both true", description: "Each route out, separately. Off for a decision that must be answered, or for work in progress. AlertDialogContent fixes both off." },
						{ name: "OverlayContent surface", type: '"framed" | "bare"', default: '"framed"', description: "bare drops the region dividers, for content that draws its own chrome." },
						{ name: "OverlayContent initialFocusRef", type: "RefObject<HTMLElement>", description: "What to focus on open, instead of the first tabbable node." },
						{ name: "OverlayContent showCloseButton", type: "boolean", default: "true", description: "The corner dismiss control. AlertDialogContent turns it off." },
						{ name: "OverlayContent strings", type: "Partial<OverlayStrings>", description: "The accessible name the corner dismiss control carries." },
						{ name: "OverlayHeader / OverlayBody / OverlayFooter", type: "component", description: "The three regions. Header and footer hold their edge while the body scrolls, so a long surface never scrolls its own title away." },
						{ name: "OverlayTitle / OverlayDescription", type: "component", description: "Wired to the dialog's accessible name and description — a surface without a title has neither." },
						{ name: "OverlayTrigger / OverlayClose", type: "component", description: "Render a bare button by default; `render` hands the behaviour to your own control instead, so the trigger is a kit Button rather than something this family styles." },
						{ name: "OverlayDismissArea", type: "component", description: "Any button inside dismisses — for a footer whose every control should close. Wrapping each button individually is where the wiring gets forgotten; keep OverlayClose per action when only some of them close." },
					]}
				/>
			</Example>

			<Example id="dialog-api" title="Dialog API">
				<PropTable owner="DialogContent"
					rows={[
						{ name: "DialogContent", type: "OverlayContent props, without placement", description: "OverlayContent with placement fixed to centre. modality, surface, dismissal, initialFocusRef and showCloseButton are the Overlay props above, with the same defaults." },
						{ name: "Overlay / OverlayTrigger / OverlayClose / OverlayHeader / OverlayBody / OverlayFooter / OverlayTitle / OverlayDescription / OverlayDismissArea", type: "component", description: "The rest of a dialog is Overlay's own parts, imported from base/overlay under their own names. There is no second name for them, so nothing about them can drift." },
					]}
				/>
			</Example>

			<Example id="alert-dialog-api" title="Alert dialog API">
				<PropTable owner="@/components/base/alert-dialog#AlertDialogContent"
					rows={[
						{ name: "AlertDialogContent", type: "OverlayContent props, without placement or dismissal", description: "Fixes placement to centre, role to alertdialog, and both dismissal routes and the corner close off. modality, surface and initialFocusRef are the Overlay props above." },
						{ name: "AlertDialogAction / AlertDialogCancel", api: ["@/components/base/alert-dialog#AlertDialogAction", "@/components/base/alert-dialog#AlertDialogCancel"], type: "component", description: "The two answers. Both close the dialog; Action is the one that commits. There is no dismissal and no corner close — dismissal and showCloseButton are fixed off." },
						{ name: "AlertDialogMedia", api: "@/components/base/alert-dialog#AlertDialogMedia", type: "component", description: "A leading glyph or illustration above the title, for a confirmation whose severity is worth showing before it is read." },
					]}
				/>
			</Example>

			<Example id="sheet-api" title="Sheet API">
				<PropTable owner="SheetContent"
					rows={[
						{ name: "side", type: '"inline-start" | "inline-end" | "block-start" | "block-end"', default: '"inline-end"', description: "The edge it enters from — OverlayContent placement, minus centre. Logical, so it follows the writing mode." },
						{ name: "size", type: '"sm" | "md" | "lg" | "full" | CSS length', default: '"md"', description: "The CROSS axis. A side panel takes it as a width; a top or bottom one sizes to its content and takes this as the ceiling." },
						{ name: "length", type: '"full" | CSS length', default: '"full"', description: "How far it runs ALONG the edge, measured against the space the inset leaves rather than the viewport — 70% of an inset panel is 70% of what is between the offsets, and the rest is split between the two ends. Full needs no inset to look right, which is why a corner-anchored sheet sets only inset." },
						{ name: "inset", type: "boolean | CSS length", default: "false", description: "ONE offset, spent on every side the panel does not run to — so an inset side panel sits the same distance from the top, the side, and the bottom. Any gap detaches it, rounds all four corners, and gives it a full border." },
						{ name: "modality / surface / dismissal / initialFocusRef / showCloseButton", type: "as OverlayContent", description: "Passed through unchanged, with the Overlay defaults. A sheet is where non-modal earns its place: an inspector you keep working beside." },
						{ name: "defaults.sheet", api: "@/lib/ui-provider#UIConfig.defaults.sheet", type: "{ side, size, length, inset }", description: "The same four on UIProvider, for a product that decides the shape once." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
