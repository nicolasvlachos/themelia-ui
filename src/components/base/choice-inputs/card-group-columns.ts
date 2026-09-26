/* The column class for a card group, shared by the radio and checkbox versions. */
import styles from "./choice.module.css"
import type { ChoiceColumns } from "./choice.types"

export const COLUMN_CLASS = {
	1: styles.columns1,
	2: styles.columns2,
	3: styles.columns3,
	4: styles.columns4,
} satisfies Record<ChoiceColumns, string>
