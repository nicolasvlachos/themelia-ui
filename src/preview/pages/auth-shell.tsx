import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { ArrowRightIcon, GlobeIcon, ShieldCheckIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Button, LoaderButton } from "@/components/base/buttons"
import { Checkbox } from "@/components/base/choice-inputs"
import { DialogContent } from "@/components/base/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/base/feedback"
import { FormField } from "@/components/base/forms"
import { Overlay, OverlayBody, OverlayDescription, OverlayHeader, OverlayTitle, OverlayTrigger } from "@/components/base/overlay"
import { Input, PasswordInput } from "@/components/base/text-inputs"
import { Stack } from "@/components/base/structure"
import { DisplayLabel, Heading, Text } from "@/components/base/typography"
import { AuthCard, AuthFooterLinks, AuthShell, AuthSplitPanel } from "@/components/layout"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import styles from "./auth-shell.module.css"

const BRAND = {
	logo: <ShieldCheckIcon aria-hidden />,
	label: "Acme",
	description: "Operations console",
	href: "#/auth-shell",
}

const POLICY = [
	{ label: "Terms", href: "#/auth-shell" },
	{ label: "Privacy", href: "#/auth-shell" },
]

/* Local demo state belongs to the consumer. The layout components only receive slots. */
function SignInDemo({ showFailureControl = false }: { showFailureControl?: boolean }) {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [simulateError, setSimulateError] = useState(false)
	const [state, setState] = useState<"idle" | "submitting" | "error" | "success">("idle")
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
	const emailRef = useRef<HTMLInputElement>(null)
	const passwordRef = useRef<HTMLInputElement>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pending = state === "submitting"

	useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (pending || state === "success") return
		const nextErrors = {
			email: /^\S+@\S+\.\S+$/.test(email.trim()) ? undefined : "Enter an email address, such as jane@example.com.",
			password: password.length >= 8 ? undefined : "Use at least 8 characters for this demo.",
		}
		setErrors(nextErrors)
		if (nextErrors.email || nextErrors.password) {
			setState("idle")
			;(nextErrors.email ? emailRef : passwordRef).current?.focus()
			return
		}
		setState("submitting")
		timer.current = setTimeout(() => {
			setState(simulateError ? "error" : "success")
			timer.current = null
		}, 700)
	}

	return (
		<form noValidate aria-busy={pending || undefined} onSubmit={submit}>
			<Stack gap="xl">
				{state === "error" && (
					<Alert tone="destructive">
						<AlertTitle>Unable to sign in</AlertTitle>
						<AlertDescription>The demo connection failed. Turn off the connection error below and try again. Your details are still here.</AlertDescription>
					</Alert>
				)}
				{state === "success" && (
					<Alert tone="success">
						<AlertTitle>Signed in</AlertTitle>
						<AlertDescription>The demo is complete. No account was created.</AlertDescription>
					</Alert>
				)}
				<FormField label="Email" required error={errors.email}>
					<Input
						ref={emailRef}
						type="email"
						autoComplete="username"
						placeholder="jane@example.com"
						value={email}
						readOnly={pending || state === "success"}
						onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }}
					/>
				</FormField>
				<FormField label="Password" required error={errors.password} hint="Use any 8 characters for this demo.">
					<PasswordInput
						ref={passwordRef}
						autoComplete="current-password"
						value={password}
						readOnly={pending || state === "success"}
						onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })) }}
					/>
				</FormField>
				{showFailureControl && (
					<Checkbox
						label="Simulate a connection error"
						checked={simulateError}
						disabled={pending || state === "success"}
						onChange={(event) => setSimulateError(event.target.checked)}
					/>
				)}
				{state === "success" ? (
					<Button fullWidth tone="neutral" buttonStyle="outline" onClick={() => {
						setState("idle")
						setPassword("")
						emailRef.current?.focus()
					}}>Try again</Button>
				) : (
					<LoaderButton type="submit" fullWidth loading={pending}>Sign in</LoaderButton>
				)}
			</Stack>
		</form>
	)
}

function WorkspacePanel() {
	return (
		<>
			<Stack gap="xl">
				<DisplayLabel>Built for your team</DisplayLabel>
				<Heading level={3} size="2xl">A clearer start to your working day.</Heading>
				<Text type="secondary" lineHeight="relaxed">Bring your people, projects, and decisions into one shared workspace.</Text>
			</Stack>
			<Stack gap="lg">
				<Text type="inherit" size="lg" lineHeight="relaxed">“Everything we need is ready when we sign in. We spend more time doing the work together.”</Text>
				<Text type="secondary" size="sm">Jordan Lee · Operations at Northwind</Text>
			</Stack>
		</>
	)
}

function SplitSignInDemo({ stackedPanel, legalLabel }: { stackedPanel: boolean; legalLabel: string }) {
	return (
		<AuthShell
			className={styles.canvas}
			contentRender={<div />}
			variant="split"
			splitSide="start"
			splitMobile={stackedPanel ? "stacked" : "hidden"}
			brand={BRAND}
			level={3}
			title="Good to see you again"
			description="Pick up where your team left off."
			policyLinks={POLICY}
			strings={{ legalLabel }}
			languageSwitcher={<Text size="xs" type="secondary"><GlobeIcon aria-hidden className={styles.inlineIcon} /> English (UK)</Text>}
			splitPanel={<WorkspacePanel />}
		>
			<SignInDemo />
		</AuthShell>
	)
}

export function AuthShellPage() {
	const [stackedPanel, setStackedPanel] = useState(true)
	const expandedTitleId = useId()
	const expandedDescriptionId = useId()
	return (
		<ComponentPage
			title="Auth shells"
			summary="A welcoming entry to your application: a brand, a focused form, useful links, and an optional story alongside it. Compose the page with AuthShell, or arrange your own AuthCard and AuthSplitPanel. Your application owns the form and its flow."
			importPath="@/components/layout/auth"
			exports={["AuthShell", "AuthCard", "AuthFooterLinks", "AuthSplitPanel"]}
		>
			<Example
				id="auth-shell"
				title="Card · a complete sign-in page"
				description="Try an empty submission, then enter sample details. Toggle the connection error to exercise recovery. These are local demo states; nothing is sent or stored. The canvas grows as validation and feedback appear, keeping the footer reachable."
				stacked
				code={`<AuthShell
  brand={brand}
  title="Welcome back"
  description="Sign in to your Acme workspace."
  cardFooter={<Text size="xs">Local demo · no account required</Text>}
  policyLinks={policy}
>
  <YourSignInForm />
</AuthShell>`}
			>
				<div className={styles.frame} data-auth-preview>
					<AuthShell
						className={styles.canvas}
						contentRender={<div />}
						level={3}
						brand={BRAND}
						title="Welcome back"
						description="Sign in to your Acme workspace."
						cardFooter={<Text size="xs" type="secondary">Local demo · no account required</Text>}
						postCard={<Text size="sm" type="secondary">New here? Ask your administrator for an invitation.</Text>}
						policyLinks={POLICY}
						strings={{ legalLabel: "Legal (card example)" }}
					>
						<SignInDemo showFailureControl />
					</AuthShell>
				</div>
			</Example>

			<Example
				id="auth-bare"
				title="Bare · a quiet canvas"
				description="Keep the same heading and form rhythm when the page already provides the surface. A short form uses the space around it; a tall form grows naturally."
				stacked
				code={`<AuthShell variant="bare" size="sm" brand={brand}
  title="Make yourself at home" policyLinks={policy}>
  <YourSignInForm />
</AuthShell>`}
			>
				<div className={styles.frame} data-auth-preview>
					<AuthShell
						className={styles.canvas}
						contentRender={<div />}
						variant="bare"
						size="sm"
						level={3}
						brand={BRAND}
						title="Make yourself at home"
						description="Your workspace is ready for you."
						policyLinks={POLICY}
						strings={{ legalLabel: "Legal (bare example)" }}
					>
						<SignInDemo />
					</AuthShell>
				</div>
			</Example>

			<Example
				id="auth-split"
				title="Split · a story beside the form"
				description="The panel joins the form in a second column when this container reaches 56rem. Expand the preview to inspect the wide layout. At narrower widths the panel can follow the form or disappear; the form always comes first in reading and keyboard order."
				stacked
				code={`<AuthShell variant="split" splitSide="start" splitMobile="stacked"
  splitPanel={<WorkspaceStory />} brand={brand} title="Good to see you again">
  <YourSignInForm />
</AuthShell>`}
			>
				<Stack direction="horizontal" align="center" justify="between" gap="lg" wrap>
					<Checkbox label="Show the panel on small screens" checked={stackedPanel} onChange={(event) => setStackedPanel(event.target.checked)} />
					<Overlay>
						<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>Expand split preview</OverlayTrigger>
						<DialogContent className={styles.expandedDialog} aria-labelledby={expandedTitleId} aria-describedby={expandedDescriptionId}>
							<OverlayHeader>
								<OverlayTitle id={expandedTitleId}>Split auth preview</OverlayTitle>
								<OverlayDescription id={expandedDescriptionId}>The same composition adapts to the space available. This is a local sign-in demo.</OverlayDescription>
							</OverlayHeader>
							<OverlayBody>
								<div className={styles.frame}>
									<SplitSignInDemo stackedPanel={stackedPanel} legalLabel="Legal (expanded split example)" />
								</div>
							</OverlayBody>
						</DialogContent>
					</Overlay>
				</Stack>
				<div className={styles.frame} data-auth-preview>
					<SplitSignInDemo stackedPanel={stackedPanel} legalLabel="Legal (split example)" />
				</div>
			</Example>

			<Example
				id="auth-composed"
				title="Composed · bring your own surface"
				description="AuthSplitPanel takes the two regions independently. Here AuthCard and AuthFooterLinks form one side, while a workspace invitation forms the other. This composition can also live inside an application page or a dialog."
				stacked
				code={`<AuthSplitPanel
  panelMobile="stacked"
  form={<Stack gap="xl">
    <AuthCard title="Join your team" headerEnd={<Badge>Invite</Badge>}>
      <YourSignInForm />
    </AuthCard>
    <AuthFooterLinks label="Legal" links={policy} />
  </Stack>}
  panel={<WorkspaceInvitation />}
/>`}
			>
				<div id="auth-card" className={styles.frame} data-auth-preview>
					<AuthSplitPanel
						className={styles.composed}
						panelMobile="stacked"
						form={
							<Stack gap="xl" className={styles.formColumn}>
								<AuthCard
									level={3}
									title="Join your team"
									description="Sign in to accept your workspace invitation."
									headerEnd={<Badge tone="info">Invite</Badge>}
									footer={<Text size="xs" type="secondary">Invited by alex@northwind.example</Text>}
								>
									<SignInDemo />
								</AuthCard>
								<AuthFooterLinks label="Legal (composed example)" links={POLICY} />
							</Stack>
						}
						panel={
							<Stack gap="xl">
								<DisplayLabel>Northwind workspace</DisplayLabel>
								<Heading level={3} size="xl">Your next chapter starts together.</Heading>
								<Text type="secondary" lineHeight="relaxed">You have been invited to collaborate with the operations team. Your projects and conversations will be waiting.</Text>
								<Text type="inherit" size="sm"><ArrowRightIcon aria-hidden className={styles.inlineIcon} /> One workspace for the whole team</Text>
							</Stack>
						}
					/>
				</div>
			</Example>

			<Example id="auth-rule" title="The form belongs to your application" stacked>
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
