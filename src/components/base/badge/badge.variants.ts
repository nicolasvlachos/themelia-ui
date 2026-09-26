/* The published variant map, in its own file so badge.tsx exports only a component (fast refresh). */
import { cvm } from "@/lib/cvm"

import styles from "./badge.module.css"

export const badgeVariants = cvm(styles.root, {
	variants: {
		tone: {
			neutral: styles.toneNeutral,
			primary: styles.tonePrimary,
			secondary: styles.toneSecondary,
			success: styles.toneSuccess,
			info: styles.toneInfo,
			warning: styles.toneWarning,
			destructive: styles.toneDestructive,
		},
		variant: {
			soft: styles.variantSoft,
			solid: styles.variantSolid,
			outline: styles.variantOutline,
		},
	},
	defaultVariants: {
		tone: "neutral",
		variant: "soft",
	},
})
