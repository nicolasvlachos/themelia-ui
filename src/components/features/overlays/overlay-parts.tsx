/**
 * Parts the three action overlays share: tone glyph, header, notice and generated footer.
 * One footer keeps button order and pending behaviour identical across the family.
 */
import type { ReactNode } from "react"
import {
	CircleAlertIcon, CircleCheckIcon, CircleHelpIcon, InfoIcon, TriangleAlertIcon,
} from "lucide-react"

import { Button } from "@/components/base/buttons"
import { VisuallyHidden } from "@/components/base/display"
import { Alert, AlertDescription } from "@/components/base/feedback"
import { cx } from "@/lib/cx"

import type {
	OverlayActionStrings,
} from "./overlays.strings"
import type {
	OverlayButtonStyle, OverlayButtonTone, OverlayTone,
} from "./overlays.types"
import styles from "./overlays.module.css"

const TONE_ICON: Record<OverlayTone, ReactNode> = {
	neutral: <CircleHelpIcon aria-hidden />,
	destructive: <CircleAlertIcon aria-hidden />,
	warning: <TriangleAlertIcon aria-hidden />,
	info: <InfoIcon aria-hidden />,
	success: <CircleCheckIcon aria-hidden />,
}

/** The tone's glyph. Decorative — the tone is also said in the title and the copy. */
export function OverlayToneIcon({ tone }: { tone: OverlayTone }) {
	return (
		<span data-tone={tone} className={styles.toneIcon}>
			{TONE_ICON[tone]}
		</span>
	)
}

export function OverlayTitleRow({
	tone,
	showIcon,
	children,
}: {
	tone: OverlayTone
	showIcon?: boolean
	children: ReactNode
}) {
	if (!showIcon) return <>{children}</>
	return (
		<span className={styles.titleRow}>
			<OverlayToneIcon tone={tone} />
			<span className={styles.titleText}>{children}</span>
		</span>
	)
}

/** The consequence, stated before the reader commits to it. */
export function OverlayNotice({ tone, children }: { tone: OverlayTone; children: ReactNode }) {
	return (
		<div className={styles.notice}>
			<Alert tone={tone === "neutral" ? "info" : tone}>
				<AlertDescription>{children}</AlertDescription>
			</Alert>
		</div>
	)
}

export interface OverlayFooterActionsProps {
	copy: OverlayActionStrings
	showCancel: boolean
	showConfirm: boolean
	confirmTone: OverlayButtonTone
	confirmStyle: OverlayButtonStyle
	busy: boolean
	formId?: string
	onCancel: () => void
	onConfirm: () => void | Promise<void>
}

export function OverlayFooterActions({
	copy,
	showCancel,
	showConfirm,
	confirmTone,
	confirmStyle,
	busy,
	formId,
	onCancel,
	onConfirm,
}: OverlayFooterActionsProps) {
	if (!showCancel && !showConfirm) return null

	return (
		<div className={cx("overlay-actions--component", styles.actions)}>
			{/* Cancel first, confirm last — fixed on purpose, so the confirm never moves. */}
			{showCancel && (
				<Button
					type="button"
					tone="neutral"
					buttonStyle="outline"
					// Disabled while pending so cancel cannot race the in-flight confirm.
					disabled={busy}
					onClick={onCancel}
				>
					{copy.cancel}
				</Button>
			)}
			{showConfirm && (
				<Button
					// `submit` only with `formId`; otherwise it would submit any ancestor form.
					type={formId ? "submit" : "button"}
					form={formId}
					tone={confirmTone}
					buttonStyle={confirmStyle}
					loading={busy}
					onClick={formId ? undefined : () => void onConfirm()}
				>
					{copy.confirm}
				</Button>
			)}
		</div>
	)
}

/** The header, hidden from view but not from the accessibility tree. */
export function OverlayHiddenHeader({
	title,
	description,
	titleId,
	descriptionId,
	Title,
	Description,
}: {
	title?: ReactNode
	description?: ReactNode
	titleId?: string
	descriptionId?: string
	Title: React.ComponentType<{ children?: ReactNode; id?: string }>
	Description: React.ComponentType<{ children?: ReactNode; id?: string }>
}) {
	return (
		<VisuallyHidden>
			{!!title && <Title id={titleId}>{title}</Title>}
			{!!description && <Description id={descriptionId}>{description}</Description>}
		</VisuallyHidden>
	)
}
