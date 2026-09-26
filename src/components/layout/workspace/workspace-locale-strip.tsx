/**
 * WorkspaceLocaleStrip: the languages a record exists in and how complete each is. A strip,
 * not a select, so every language's completion is visible.
 */
import type { ComponentProps, ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { Progress } from "@/components/base/feedback"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	defaultWorkspaceLocaleStripStrings, type WorkspaceLocaleStripStrings,
} from "./workspace.strings"
import styles from "./workspace.module.css"

export interface WorkspaceLocaleItem {
	id: string
	label: ReactNode
	description?: ReactNode
	/** 0–100. */
	completion?: number
	/** A chip beside the label — "Draft", "Published". */
	status?: ReactNode
	disabled?: boolean
}

export interface WorkspaceLocaleStripProps extends Omit<ComponentProps<"div">, "onSelect"> {
	locales: WorkspaceLocaleItem[]
	activeLocale?: string
	onLocaleChange?: (locale: WorkspaceLocaleItem) => void
	/** Controls at the strip's trailing edge — "Add language". */
	actions?: ReactNode
	strings?: Partial<WorkspaceLocaleStripStrings>
}

export function WorkspaceLocaleStrip({
	locales,
	activeLocale,
	onLocaleChange,
	actions,
	strings,
	className,
	...props
}: WorkspaceLocaleStripProps) {
	const copy = { ...defaultWorkspaceLocaleStripStrings, ...strings }

	return (
		<div
			data-slot="workspace-locale-strip"
			role="group"
			aria-label={copy.label}
			className={cx("workspace-locale-strip--component", styles.strip, className)}
			{...props}
		>
			<div className={styles.stripList}>
				{locales.map((locale) => {
					const active = locale.id === activeLocale
					const completion =
						locale.completion === undefined
							? undefined
							: Math.min(100, Math.max(0, Math.round(locale.completion)))

					return (
						<button
							key={locale.id}
							type="button"
							/* `aria-pressed`, not `aria-current`: alternatives, not a position in a set. */
							aria-pressed={active}
							disabled={locale.disabled}
							onClick={() => onLocaleChange?.(locale)}
							data-active={active || undefined}
							className={styles.stripItem}
						>
							<span className={styles.stripHead}>
								<Text tag="span" weight="medium">{locale.label}</Text>
								{active && <Badge tone="primary">{copy.active}</Badge>}
								{!!locale.status && <Badge tone="neutral">{locale.status}</Badge>}
							</span>
							{!!locale.description && (
								<Text tag="span" size="xs" type="secondary">{locale.description}</Text>
							)}
							{completion !== undefined && (
								<Progress value={completion} label={copy.completion(completion)} />
							)}
						</button>
					)
				})}
			</div>
			{!!actions && <div className={styles.stripActions}>{actions}</div>}
		</div>
	)
}
