import { Text, TextLink } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function OverlayPage() {
	return (
		<ComponentPage>
			<Example
				example="overlay/overlay-placement"
				title="placement"
				description="Centre reads as a dialog; an edge reads as a sheet or a drawer. The word is the only difference between them — there is no second component for the edge case. DialogContent is this setting fixed at centre, and SheetContent is this setting at an edge with a default shape."
			/>

			<Example
				example="overlay/modality"
				title="modality"
				description="How much of the page the surface takes hostage. `modal`, the default, traps focus, dims the page and locks its scroll. `trap-focus` keeps focus inside but leaves the page scrollable and clickable. `non-modal` drops the scrim, the trap and the scroll lock — for an inspector you work beside rather than answer."
			/>

			<Example
				example="overlay/overlay-dismissal"
				title="dismissal"
				description="Both routes out are separately switchable. A decision the reader must answer turns off the backdrop; destructive or in-progress work turns off Escape. Turning both off leaves the footer's own control as the only way out, which is a deliberate choice and not a default — it is the one AlertDialogContent makes."
			/>

			<Example
				example="overlay/overlay-controlled"
				title="Controlled"
				description="`open` and `onOpenChange` on the root, for a surface opened by something other than its own trigger — a row action, a keyboard shortcut, a route."
			/>

			<Example
				example="overlay/overlay-structure"
				title="Header, body and footer"
				description="A flush shell with three regions. Header and footer hold their edges and the body owns the scroll, so a long surface never scrolls its own title or its buttons away. Every preset below is this structure."
			/>

			<Example
				example="overlay/dialog-surface"
				title="Bare surface"
				description="No region dividers and no corner control. For a short decision whose two buttons are the whole interface — a framed shell around four lines of text is chrome around nothing."
			/>

			<Example
				example="overlay/dialog-focus"
				title="Where focus lands"
				description="Focus goes to the first tabbable node in the surface, and the corner dismiss comes last in the DOM, so it is never the one. initialFocusRef names the target explicitly — here the field the surface was opened to fill in — so reordering the body cannot move it."
			/>

			<Example
				example="overlay/dialog-popups"
				title="Popups inside an overlay"
				description="A modal overlay lives in the browser's top layer and makes the rest of the page inert, so a menu or select portalled to the body would paint underneath it and ignore every click. The overlay hosts its own portal target, so popups opened inside it render inside it — stacked above it, reachable by keyboard, and closed one layer at a time by Escape. The same holds in every preset."
			/>

			<Example id="overlay-rule" title="Three presets, one surface">
				<Callout label="Rule">
					A preset is a content part, not a second implementation: it is{" "}
					<code>OverlayContent</code> with settings filled in, placed inside Overlay's own
					root beside Overlay's trigger, and holding Overlay's title, description, body and
					close. A preset module exports only the parts that set something. Use one when its
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
					Features tier generates it: <TextLink href="#/action-overlays">Action overlays</TextLink>{" "}
					are ActionDialog, ActionSheet and ConfirmDialog, and they render through this same
					surface.
				</Text>
			</Example>

			<Example
				example="overlay/dialog"
				title="Dialog"
				description={'DialogContent is OverlayContent with `placement="center"` filled in, and that is the whole of the dialog. The root, trigger, close, header, body, footer, title and description are Overlay\'s own parts, imported under their own names — so everything above applies unchanged.'}
			/>

			<Example
				example="overlay/alert-dialog"
				title="Alert dialog"
				description="The same centred surface with both dismissal routes off, no corner close, and role=alertdialog: the backdrop and Escape do not decide for the reader. Nothing closes it but an answer — which is the whole difference from a dialog, so the two cannot drift in shell, header, footer or scrolling."
			/>

			<Example id="alert-dialog-rule" title="An alert dialog cannot be dismissed by accident">
				<Callout label="Rule">
					An alert dialog turns off backdrop and Escape dismissal. Every other overlay
					leaves both on — but this one exists precisely because the answer matters, and
					a stray click outside is not an answer.
				</Callout>
			</Example>

			<Example
				example="overlay/sheet"
				title="Sheet"
				description={'SheetContent is OverlayContent at an edge. `side` is `placement` under the name a panel is read by, and it adds a default shape — flush, full length, the default size — that the provider can change once. Everything else, header and footer included, is Overlay\'s own part. The sides span the viewport; top and bottom size to their content.'}
			/>

			<Example
				example="overlay/sheet-shape"
				title="Size, length, and inset"
				description="Three measurements, because they answer three questions. size is how much of the CROSS axis it takes — a side panel's width. inset is the gap from the viewport, and ONE offset covers every side the panel does not run to, so a corner-anchored panel needs nothing else. length shortens it further, as a fraction of the space the inset leaves rather than of the viewport, and the remainder is split between the two ends. All three are OverlayContent props; SheetContent only gives them defaults."
			/>

			<Example
				example="overlay/sheet-provider"
				title="Decided once, not per call site"
				description="A product that wants every panel corner-anchored says so on the provider. Both sheets below are written the same way — the scoped one inherits the shape. Repeating three props at every call site is how the fourth one ends up different."
			/>

			<Example
				example="overlay/overlay-backdrop"
				title="A blurred scrim, when a product wants one"
				description="The scrim is a tint and nothing else by default: a backdrop blur re-rasterises everything behind the surface on every frame, and it measurably slowed dismissal. A product that wants the frosted look — and can pay for it — asks once on the provider, and every modal inside picks it up."
			/>

			<Example id="overlay-api" title="Overlay API">
				<PropTable
					owners={[
						"Overlay",
						"OverlayTrigger",
						"OverlayContent",
						"OverlayDismissal",
						"OverlayHeader",
						"OverlayBody",
						"OverlayFooter",
						"OverlayTitle",
						"OverlayDescription",
						"OverlayClose",
						"OverlayDismissArea",
						"UIConfig.overlay",
					]}
				/>
			</Example>

			<Example id="dialog-api" title="Dialog API">
				<PropTable owners={["DialogContent"]} />
				<PropTable
					symbols={[
						"Overlay",
						"OverlayTrigger",
						"OverlayClose",
						"OverlayHeader",
						"OverlayBody",
						"OverlayFooter",
						"OverlayTitle",
						"OverlayDescription",
						"OverlayDismissArea",
					]}
				/>
			</Example>

			<Example id="alert-dialog-api" title="Alert dialog API">
				<PropTable owners={["AlertDialogContent", "AlertDialogAction", "AlertDialogCancel", "AlertDialogMedia"]} />
			</Example>

			<Example id="sheet-api" title="Sheet API">
				<PropTable owners={["SheetContent"]} />
			</Example>
		</ComponentPage>
	)
}
