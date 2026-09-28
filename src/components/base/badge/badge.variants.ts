/* Badge's class map, in its own file so badge.tsx exports only a component (fast refresh). */
import { cvm } from "@/lib/cvm"

import styles from "./badge.module.css"

export const badgeVariants = cvm(styles.root, {
	variants: {
		appearance: {
			soft: styles.appearanceSoft,
			solid: styles.appearanceSolid,
			outline: styles.appearanceOutline,
		},
	},
	defaultVariants: {
		appearance: "soft",
	},
})
