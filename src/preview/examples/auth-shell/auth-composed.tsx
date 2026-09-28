import { ArrowRightIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { DisplayLabel, Heading, Text } from "themelia-ui/base/typography"
import { AuthCard, AuthFooterLinks, AuthSplitPanel } from "themelia-ui/layout/auth"

import styles from "./auth-shell.module.css"
import { POLICY } from "./data"
import { SignInDemo } from "./_shared"

export default function AuthComposed() {
	return (
		<div id="auth-card" className={styles.frame} data-auth-preview>
			<AuthSplitPanel
				className={styles.composed}
				panelMobile="stacked"
				form={
					<Stack className={styles.formColumn}>
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
					<Stack>
						<DisplayLabel>Northwind workspace</DisplayLabel>
						<Heading level={3} size="xl">Your next chapter starts together.</Heading>
						<Text type="secondary" lineHeight="relaxed">You have been invited to collaborate with the operations team. Your projects and conversations will be waiting.</Text>
						<Text type="inherit" size="sm"><ArrowRightIcon aria-hidden className={styles.inlineIcon} /> One workspace for the whole team</Text>
					</Stack>
				}
			/>
		</div>
	)
}
