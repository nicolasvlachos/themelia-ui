import { useState, type ReactNode } from "react"

import { Heading, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { exampleByKey } from "../examples"
import styles from "../preview.module.css"
import { CodeBlock } from "./code-block"
import { withCodeSpans } from "./code-spans"

/**
 * One documented example: a heading, an optional note, and a Preview/Code pair.
 *
 * `example` names a file in `src/preview/examples` (`badge/badge-tones`): the preview renders
 * it and the Code tab shows its source, so the two cannot drift. Without it, `children` is
 * page content (a prop table, a callout) and there is no Code tab.
 */
export function Example({
	example,
	id,
	title,
	description,
	code,
	stacked = false,
	bleed = false,
	overflowing = false,
	children,
}: {
	example?: string
	id?: string
	title: string
	description?: ReactNode
	/** Page-authored source for a section without an example file. */
	code?: string
	stacked?: boolean
	/** Lets the preview run past the reading measure, for whole-page layouts. */
	bleed?: boolean
	/** Lets an overlay that does not portal (e.g. the mentions panel) escape the clipped frame. */
	overflowing?: boolean
	children?: ReactNode
}) {
	const [tab, setTab] = useState<"preview" | "code">("preview")
	const entry = example ? exampleByKey(example) : undefined
	const anchor = id ?? entry?.id
	const source = entry?.source ?? code

	return (
		<section id={anchor} className={cx("example--component", styles.section, overflowing && styles.sectionOverflowing)}>
			<div className={styles.sectionHeader}>
				{/* Level 2 under the page's level 1; the size is set separately. */}
				<Heading level={2} size="base">
					{withCodeSpans(title)}
				</Heading>
				{!!description && <Text type="secondary">{withCodeSpans(description)}</Text>}
			</div>

			<div className={cx(styles.example, bleed && styles.exampleBleed)}>
				{!!source && (
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

				{/* Hidden rather than unmounted on the Code tab, so a demo keeps its state. */}
				<div
					className={cx("example--preview", styles.preview, stacked && styles.previewStacked)}
					hidden={tab === "code" && !!source}
				>
					{entry ? <entry.Demo /> : children}
				</div>
				{tab === "code" && !!source && <CodeBlock code={source} />}
			</div>
		</section>
	)
}
