import { AuthShell } from "themelia-ui/layout/auth"

import styles from "./auth-shell.module.css"
import { POLICY } from "./data"
import { BRAND } from "./_brand"
import { SignInDemo } from "./_shared"

export default function AuthBare() {
	return (
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
	)
}
