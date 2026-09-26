/** The keyboard-hint strip under the list: the only place the palette's keys are stated. */
import type { ReactNode } from "react"

import { Kbd } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./global-search.module.css"

export interface GlobalSearchFooterProps {
	navigateLabel: ReactNode
	openLabel: ReactNode
	closeLabel: ReactNode
	/** The Escape key's cap. Its two neighbours are glyphs; this one is a word. */
	escKey: ReactNode
	/** Right-aligned content, e.g. the result count. */
	trailing?: ReactNode
	className?: string
}

export function GlobalSearchFooter({
	navigateLabel,
	openLabel,
	closeLabel,
	escKey,
	trailing,
	className,
}: GlobalSearchFooterProps) {
	return (
		<div className={cx("global-search-footer--component", styles.footer, className)}>
			<span className={styles.shortcuts}>
				<span className={styles.shortcut}><Kbd>↑↓</Kbd><Text tag="span" size="xs" type="secondary">{navigateLabel}</Text></span>
				<span className={styles.shortcut}><Kbd>↵</Kbd><Text tag="span" size="xs" type="secondary">{openLabel}</Text></span>
				<span className={styles.shortcut}><Kbd>{escKey}</Kbd><Text tag="span" size="xs" type="secondary">{closeLabel}</Text></span>
			</span>
			{!!trailing && <span className={styles.footerTrailing}>{trailing}</span>}
		</div>
	)
}
