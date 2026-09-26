/**
 * The illustration set for `Empty`, built from theme tokens (divs, not SVG files) so they
 * follow a retheme and both modes. Pass one as `media` with `mediaVariant="illustration"`;
 * add new ones here rather than forking `Empty`.
 */
import { SearchIcon } from "lucide-react"

import { cx } from "@/lib/cx"

import styles from "./empty-illustrations.module.css"

export interface EmptyIllustrationProps {
	className?: string
}

/**
 * Three stacked cards fading out — the generic "no records". Drawn from the theme's own
 * tokens rather than shipped as an image, so it follows a rebrand and costs no request.
 */
export function StackedCardsIllustration({ className }: EmptyIllustrationProps) {
	return (
		<div aria-hidden className={cx("stacked-cards-illustration--component", styles.stack, className)}>
			<div className={styles.stackBack} />
			<div className={styles.stackMid} />
			<div className={styles.stackFront}>
				<div className={styles.stackThumb} />
				<div className={styles.stackLines}>
					<div className={styles.lineWide} />
					<div className={styles.lineNarrow} />
				</div>
			</div>
			<div className={styles.stackFade} />
		</div>
	)
}

/**
 * Two staggered documents — for invoices, reports, files. Drawn from the theme's own tokens
 * rather than shipped as an image, so an empty state cannot be the one thing on the page
 * that ignores a rebrand — and it costs no request.
 */
export function DocumentStackIllustration({ className }: EmptyIllustrationProps) {
	return (
		<div aria-hidden className={cx("document-stack-illustration--component", styles.docs, className)}>
			<div className={cx(styles.doc, styles.docBack)}>
				<div className={styles.lineWide} />
				<div className={styles.lineNarrow} />
				<div className={styles.lineNarrow} />
			</div>
			<div className={cx(styles.doc, styles.docFront)}>
				<div className={styles.lineWide} />
				<div className={styles.lineNarrow} />
				<div className={styles.lineNarrow} />
				<div className={styles.docStatus}>
					<div className={styles.docDot} />
					<div className={styles.lineNarrow} />
				</div>
			</div>
		</div>
	)
}

/**
 * An open tray under a check — for "all caught up", not for "nothing exists". Drawn from the
 * theme's own tokens rather than shipped as an image, so it follows a rebrand and costs no
 * request.
 */
export function InboxCleanIllustration({ className }: EmptyIllustrationProps) {
	return (
		<div aria-hidden className={cx("inbox-clean-illustration--component", styles.inbox, className)}>
			<div className={styles.inboxCheck}>
				<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M3 8l3 3 7-7" />
				</svg>
			</div>
			<div className={styles.inboxTray}>
				<div className={styles.inboxLip} />
				<div className={styles.inboxRow}>
					<div className={styles.inboxLines}>
						<div className={styles.lineNarrow} />
						<div className={styles.lineShort} />
					</div>
					<div className={styles.inboxDot} />
				</div>
			</div>
		</div>
	)
}

/**
 * A magnifier on a soft disc — for "nothing matches", not "nothing exists". Drawn from the
 * theme's own tokens rather than shipped as an image, so it follows a rebrand and costs no
 * request.
 */
export function SearchGlassIllustration({ className }: EmptyIllustrationProps) {
	return (
		<div aria-hidden className={cx("search-glass-illustration--component", styles.glass, className)}>
			<SearchIcon data-sized />
		</div>
	)
}

/**
 * Three overlapping discs — for people: members, customers, contributors. Drawn from the
 * theme's own tokens rather than shipped as an image, so it follows a rebrand and costs no
 * request.
 */
export function UsersCircleIllustration({ className }: EmptyIllustrationProps) {
	return (
		<div aria-hidden className={cx("users-circle-illustration--component", styles.users, className)}>
			<div className={styles.userLeft} />
			<div className={styles.userCentre} />
			<div className={styles.userRight} />
		</div>
	)
}
