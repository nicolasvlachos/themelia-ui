import { Text, type TextType } from "themelia-ui/base/typography"

import styles from "./text-roles.module.css"

const ROLES: TextType[] = ["main", "secondary", "error", "success", "primary"]

export default function TextRoles() {
	return (
		<>
			{ROLES.map((type) => (
				<Text key={type} type={type}>
					{type} — the role picks the token.
				</Text>
			))}
			{/* inverse on the page background is invisible, which is the whole point of it. */}
			<div className={styles.inverseSurface}>
				<Text type="inverse">inverse — the role picks the token.</Text>
			</div>
		</>
	)
}
