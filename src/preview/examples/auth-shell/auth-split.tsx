import { useId, useState } from "react"
import { GlobeIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Checkbox } from "themelia-ui/base/choice-inputs"
import { DialogContent } from "themelia-ui/base/dialog"
import {
	Overlay, OverlayBody, OverlayDescription, OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { DisplayLabel, Heading, Text } from "themelia-ui/base/typography"
import { AuthShell } from "themelia-ui/layout/auth"

import styles from "./auth-shell.module.css"
import { POLICY } from "./data"
import { BRAND } from "./_brand"
import { SignInDemo } from "./_shared"

function WorkspacePanel() {
	return (
		<>
			<Stack>
				<DisplayLabel>Built for your team</DisplayLabel>
				<Heading level={3} size="2xl">A clearer start to your working day.</Heading>
				<Text type="secondary" lineHeight="relaxed">Bring your people, projects, and decisions into one shared workspace.</Text>
			</Stack>
			<Stack>
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

export default function AuthSplit() {
	const [stackedPanel, setStackedPanel] = useState(true)
	const expandedTitleId = useId()
	const expandedDescriptionId = useId()

	return (
		<>
			<Stack direction="horizontal" align="center" justify="between" wrap>
				<Checkbox label="Show the panel on small screens" checked={stackedPanel} onChange={(event) => setStackedPanel(event.target.checked)} />
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" appearance="outline" />}>Expand split preview</OverlayTrigger>
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
		</>
	)
}
