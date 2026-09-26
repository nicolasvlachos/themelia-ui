/**
 * AuthFooterLinks: a row of links under the card, from data, so separators, wrapping and
 * the accessible name are decided once.
 */
import { cx } from "@/lib/cx"

import { resolveLayoutLinkRenderer } from "../layout.types"
import type { AuthFooterLinksProps } from "./auth.types"
import styles from "./auth.module.css"

export function AuthFooterLinks({
	links,
	label,
	leadingIcon,
	renderLink,
	className,
}: AuthFooterLinksProps) {
	const link = resolveLayoutLinkRenderer({ renderLink })
	const visible = links.filter((entry) => entry.visible !== false)
	if (visible.length === 0) return null

	return (
		<nav aria-label={label} className={cx("auth-footer-links--component", styles.links, className)}>
			{!!leadingIcon && (
				<span aria-hidden className={styles.linksIcon}>
					{leadingIcon}
				</span>
			)}
			{visible.map((entry, index) =>
				entry.href ? (
					<span key={entry.key ?? index} className={styles.link}>
						{link({
							href: entry.href,
							external: entry.external,
							children: entry.label,
						})}
					</span>
				) : (
					<button
						key={entry.key ?? index}
						type="button"
						className={cx(styles.link, styles.linkButton)}
						// Drawn under 24px; the TARGET must not be. See styles/targets.css.
						data-hit-area
						onClick={entry.onClick}
					>
						{entry.label}
					</button>
				),
			)}
		</nav>
	)
}
