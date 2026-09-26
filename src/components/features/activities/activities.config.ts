/**
 * The event registry: one icon and tone per domain event, so every screen agrees.
 * The `eventConfig` prop is shallow-merged over it; unknown events fall back to the
 * neutral entry. To extend:
 *
 *     const eventConfig = { ...defaultActivityEventConfig, order_refunded: { icon: ReceiptIcon, tone: "warning" } }
 */
import {
	ArrowLeftRightIcon, BanIcon, CheckIcon, CircleDotIcon, FileEditIcon, FlagIcon,
	HeartIcon, LinkIcon, MailCheckIcon, MailIcon, MailOpenIcon, MailXIcon,
	MessageSquareIcon, PencilIcon, PlusIcon, ShieldCheckIcon, ShoppingBagIcon,
	SparklesIcon, StarIcon, Trash2Icon, TriangleAlertIcon, UserMinusIcon, UserPlusIcon,
} from "lucide-react"

import type { ActivityEventConfig, ActivityEventConfigMap } from "./activities.types"

/** For an event the registry has never heard of. Neutral, and never a guess. */
export const defaultEventConfig: ActivityEventConfig = {
	icon: CircleDotIcon,
	tone: "neutral",
}

export const defaultActivityEventConfig: ActivityEventConfigMap = {
	/* Lifecycle */
	created: { icon: PlusIcon, tone: "success", label: "Created" },
	updated: { icon: PencilIcon, tone: "info", label: "Updated" },
	edited: { icon: FileEditIcon, tone: "info", label: "Edited" },
	deleted: { icon: Trash2Icon, tone: "destructive", label: "Deleted" },
	cancelled: { icon: BanIcon, tone: "destructive", label: "Cancelled" },
	restored: { icon: SparklesIcon, tone: "success", label: "Restored" },

	/* Status */
	status_changed: { icon: ArrowLeftRightIcon, tone: "primary", label: "Status changed" },
	status_transition: { icon: ArrowLeftRightIcon, tone: "primary", label: "Status changed" },
	status_override: { icon: ArrowLeftRightIcon, tone: "warning", label: "Status overridden" },

	/* People */
	assigned: { icon: UserPlusIcon, tone: "info", label: "Assigned" },
	unassigned: { icon: UserMinusIcon, tone: "destructive", label: "Unassigned" },

	/* Mail */
	mail_sent: { icon: MailIcon, tone: "info", label: "Email sent" },
	mail_delivered: { icon: MailCheckIcon, tone: "success", label: "Email delivered" },
	mail_opened: { icon: MailOpenIcon, tone: "info", label: "Email opened" },
	mail_clicked: { icon: MailOpenIcon, tone: "info", label: "Email clicked" },
	mail_bounced: { icon: MailXIcon, tone: "destructive", label: "Email bounced" },
	mail_failed: { icon: MailXIcon, tone: "destructive", label: "Email failed" },

	/* Comments */
	comment: { icon: MessageSquareIcon, tone: "neutral", label: "Comment" },
	comment_created: { icon: MessageSquareIcon, tone: "warning", label: "Comment posted" },
	comment_deleted: { icon: MessageSquareIcon, tone: "destructive", label: "Comment deleted" },

	/* Commerce */
	paid: { icon: CheckIcon, tone: "success", label: "Paid" },
	refunded: { icon: ArrowLeftRightIcon, tone: "warning", label: "Refunded" },
	confirmed: { icon: ShieldCheckIcon, tone: "success", label: "Confirmed" },
	favorited: { icon: HeartIcon, tone: "warning", label: "Favorited" },
	ordered: { icon: ShoppingBagIcon, tone: "primary", label: "Order placed" },

	/* Publishing */
	published: { icon: StarIcon, tone: "success", label: "Published" },
	flagged: { icon: FlagIcon, tone: "warning", label: "Flagged" },
	linked: { icon: LinkIcon, tone: "info", label: "Linked" },

	/* Failures */
	failed: { icon: TriangleAlertIcon, tone: "destructive", label: "Failed" },
	health_check_failed: { icon: TriangleAlertIcon, tone: "destructive", label: "Health check failed" },
}

export function resolveEventConfig(
	event: string,
	map: ActivityEventConfigMap,
): ActivityEventConfig {
	return map[event] ?? defaultEventConfig
}
