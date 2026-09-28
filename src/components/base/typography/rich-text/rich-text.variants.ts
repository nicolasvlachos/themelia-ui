/*
 * RichText's classes, in their own file so rich-text.tsx exports only a component (fast
 * refresh), and so `richTextClassName` can lend them to an element RichText cannot render.
 */
import { cx } from "@/lib/cx"

import { textClassName, type TextClassNameOptions } from "../text"
import styles from "./rich-text.module.css"

/**
 * RichText's prose surface and type for an element RichText cannot render: an editor's
 * content-editable root, which its library creates. The leading defaults to `relaxed`, as on
 * RichText, so a body reads the same while it is edited and once it is posted.
 *
 *   editor.root.className = richTextClassName()
 */
export function richTextClassName({ lineHeight = "relaxed", ...options }: TextClassNameOptions = {}): string {
	return cx(styles.root, textClassName({ lineHeight, ...options }))
}
