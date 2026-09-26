import { Text } from "themelia-ui/base/typography"
import { AuthShell } from "themelia-ui/layout/auth"

import styles from "./auth-shell.module.css"
import { POLICY } from "./data"
import { BRAND } from "./_brand"
import { SignInDemo } from "./_shared"

export default function AuthShellExample() {
	return (
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
	)
}
