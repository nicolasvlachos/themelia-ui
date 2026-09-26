import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AuthShellPage() {
	return (
		<ComponentPage>
			<Example
				example="auth-shell/auth-shell"
				title="Card · a complete sign-in page"
				description="Try an empty submission, then enter sample details. Toggle the connection error to exercise recovery. These are local demo states; nothing is sent or stored. The canvas grows as validation and feedback appear, keeping the footer reachable."
			/>

			<Example
				example="auth-shell/auth-bare"
				title="Bare · a quiet canvas"
				description="Keep the same heading and form rhythm when the page already provides the surface. A short form uses the space around it; a tall form grows naturally."
			/>

			<Example
				example="auth-shell/auth-split"
				title="Split · a story beside the form"
				description="The panel joins the form in a second column when this container reaches 56rem. Expand the preview to inspect the wide layout. At narrower widths the panel can follow the form or disappear; the form always comes first in reading and keyboard order."
			/>

			<Example
				example="auth-shell/auth-composed"
				title="Composed · bring your own surface"
				description="AuthSplitPanel takes the two regions independently. Here AuthCard and AuthFooterLinks form one side, while a workspace invitation forms the other. This composition can also live inside an application page or a dialog."
			/>

			<Example id="auth-rule" title="The form belongs to your application">
				<Callout label="Composition">
					Use the slots for your own notices, methods, steps, and actions. AuthShell owns the
					page arrangement; AuthCard owns its surface; AuthSplitPanel arranges two regions.
					Validation, submission, and authentication stay with the consuming application.
				</Callout>
			</Example>

			<Example id="auth-api" title="API">
				<PropTable owners={["AuthShell", "AuthCard", "AuthSplitPanel", "AuthFooterLinks"]} />
			</Example>
		</ComponentPage>
	)
}
