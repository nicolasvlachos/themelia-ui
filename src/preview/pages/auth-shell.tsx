import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AuthShellPage() {
	return (
		<ComponentPage
			title="Auth shells"
			summary="A welcoming entry to your application: a brand, a focused form, useful links, and an optional story alongside it. Compose the page with AuthShell, or arrange your own AuthCard and AuthSplitPanel. Your application owns the form and its flow."
			importPath="@/components/layout/auth"
			exports={["AuthShell", "AuthCard", "AuthFooterLinks", "AuthSplitPanel"]}
		>
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
				<PropTable owner="AuthShell"
					rows={[
						{ name: "brand", type: "ReactNode | AuthBrandConfig", description: "A rendered mark, or { logo, label, description, href } for the shell to arrange." },
						{ name: "eyebrow / title / description", type: "ReactNode", description: "The card's heading block." },
						{ name: "headerEnd", type: "ReactNode", description: "At the end of the header row — a locale switcher, a step count." },
						{ name: "banner", type: "ReactNode", description: "Above the form: an expired link, a required invitation." },
						{ name: "cardMedia / cardFooter", type: "ReactNode", description: "A strip above the header and a band under the content, inside the frame." },
						{ name: "postCard / footer", type: "ReactNode", description: "Content after the card and after the link rows." },
						{ name: "footerLinks / policyLinks / languageLinks", type: "AuthLink[]", description: "Named rows of links that wrap with the available width." },
						{ name: "languageSwitcher", type: "ReactNode", description: "A rendered control when a link row is the wrong shape." },
						{ name: "variant", type: '"card" | "bare" | "split"', default: '"card"', description: "A raised surface, a bare form, or a form with a companion panel." },
						{ name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The surface width." },
						{ name: "align", type: '"center" | "start"', default: '"center"', description: "center distributes spare height; tall content still grows naturally. start keeps content at the top." },
						{ name: "contentRender", type: 'useRender.ComponentProps<"main">["render"]', description: "Use <div /> when the host page already owns the main landmark." },
						{ name: "splitPanel / splitSide", type: 'ReactNode / "start" | "end"', default: '"end"', description: "The companion panel and its column. The form stays first in the DOM." },
						{ name: "splitMobile", type: '"hidden" | "stacked"', default: '"hidden"', description: "The panel's behavior below 56rem of shell width." },
					]}
				/>
				<PropTable owner="AuthCard" rows={[
					{ name: "surface", type: '"card" | "bare"', default: '"card"', description: "bare removes framing and padding while retaining the header, content, and footer rhythm." },
					{ name: "eyebrow / title / description / headerEnd", type: "ReactNode", description: "The heading region and a trailing control or status." },
					{ name: "media / banner / footer", type: "ReactNode", description: "Content above the header, above the form, and in the footer band." },
				]} />
				<PropTable owner="AuthSplitPanel" rows={[
					{ name: "form / panel", type: "ReactNode", description: "Independent regions. Omitting panel gives the form the full available width." },
					{ name: "panelPosition", type: '"start" | "end"', default: '"end"', description: "The panel's visual column. Reading and keyboard order remain form first." },
					{ name: "panelMobile", type: '"hidden" | "stacked"', default: '"hidden"', description: "The panel's behavior below 56rem of this container's width." },
				]} />
				<PropTable owner="AuthFooterLinks" rows={[
					{ name: "links / label", type: "AuthLink[] / string", description: "A wrapping link row and its accessible navigation name." },
					{ name: "leadingIcon / renderLink", type: "ReactNode / LayoutLinkRenderer", description: "An optional leading glyph and the consumer's router link renderer." },
				]} />
			</Example>
		</ComponentPage>
	)
}
