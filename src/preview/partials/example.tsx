import { useState, type ReactNode } from "react"

import { Heading, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "../preview.module.css"
import { CodeBlock } from "./code-block"
import { withCodeSpans } from "./code-spans"

/**
 * One documented example: a heading, an optional note, and a Preview/Code pair. The source
 * is a string, not derived from children, which carry demo scaffolding.
 */
export function Example({
	id,
	title,
	description,
	code,
	stacked = false,
	bleed = false,
	overflowing = false,
	children,
}: {
	id?: string
	title: string
	description?: ReactNode
	code?: string
	stacked?: boolean
	/** Lets the preview run past the reading measure, for whole-page layouts. */
	bleed?: boolean
	/** Lets an overlay that does not portal (e.g. the mentions panel) escape the clipped frame. */
	overflowing?: boolean
	children: ReactNode
}) {
	const [tab, setTab] = useState<"preview" | "code">("preview")

	return (
		<section id={id} className={cx("example--component", styles.section, overflowing && styles.sectionOverflowing)}>
			<div className={styles.sectionHeader}>
				{/* Level 2 under the page's level 1; the size is set separately. */}
				<Heading level={2} size="base">
					{withCodeSpans(title)}
				</Heading>
				{!!description && <Text type="secondary">{withCodeSpans(description)}</Text>}
			</div>

			<div className={cx(styles.example, bleed && styles.exampleBleed)}>
				{!!code && (
					<div className={styles.exampleTabs} role="group" aria-label="Example view">
						<button
							type="button"
							className={cx(styles.exampleTab, tab === "preview" && styles.exampleTabActive)}
							aria-pressed={tab === "preview"}
							onClick={() => setTab("preview")}
						>
							Preview
						</button>
						<button
							type="button"
							className={cx(styles.exampleTab, tab === "code" && styles.exampleTabActive)}
							aria-pressed={tab === "code"}
							onClick={() => setTab("code")}
						>
							Code
						</button>
					</div>
				)}

				{tab === "preview" || !code ? (
					<div className={cx("example--preview", styles.preview, stacked && styles.previewStacked)}>{children}</div>
				) : (
					<CodeBlock code={code} />
				)}
			</div>
		</section>
	)
}
