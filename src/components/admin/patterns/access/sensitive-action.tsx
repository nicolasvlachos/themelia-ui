/**
 * SensitiveAction: the danger-zone row, so "this is irreversible" reads the same
 * everywhere. It does not own the confirmation dialog: the action is a slot.
 */
import { ShieldAlertIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { ContentBlock } from "@/components/base/display"
import { IconBadge } from "@/components/base/display"
import { Alert, AlertDescription } from "@/components/base/feedback"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./admin.module.css"

/* `icon` is redeclared: here it is the badge glyph, not ContentBlock's title-line node. */
export interface SensitiveActionProps
	extends Omit<ComponentProps<typeof ContentBlock>, "children" | "icon"> {
	/** The control that performs it — usually a destructive Button. */
	action?: ReactNode
	/** What will happen, stated before it does. Rendered as a note, not an error. */
	confirmation?: ReactNode
	icon?: ComponentProps<typeof IconBadge>["icon"]
}

export function SensitiveAction({
	title,
	description,
	action,
	confirmation,
	icon = ShieldAlertIcon,
	className,
	...props
}: SensitiveActionProps) {
	return (
		<ContentBlock
			surface="bordered"
			className={cx("sensitive-action--component", styles.sensitive, className)}
			{...props}
		>
			<div className={styles.sensitiveRow}>
				<IconBadge icon={icon} tone="destructive" shape="rounded" />
				<div className={styles.sensitiveBody}>
					<Text weight="medium">{title}</Text>
					{description != null && <Text type="secondary">{description}</Text>}
				</div>
				{action != null && <div className={styles.sensitiveAction}>{action}</div>}
			</div>
			{confirmation != null && (
				/* `note`, not `alert`: standing information that must not interrupt a screen reader. */
				<Alert tone="destructive" role="note" className="sensitive-action--confirmation">
					<AlertDescription>{confirmation}</AlertDescription>
				</Alert>
			)}
		</ContentBlock>
	)
}
