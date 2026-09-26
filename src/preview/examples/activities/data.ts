import { CalendarIcon, ExternalLinkIcon, PackageIcon, RotateCwIcon, UserIcon } from "lucide-react"

import type {
	ActivityItem, ActivityLogEntry, ActivityResourceConfig,
} from "themelia-ui/features/activities"
import type { CommentUser } from "themelia-ui/features/comments"
import type { MentionResource } from "themelia-ui/features/mentions"

export type Kind = "user" | "booking"

const NOW = Date.now()
const ago = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString()

/** What the log's composer can mention. */
export const RESOURCES: Partial<Record<Kind, MentionResource<Kind>>> = {
	user: {
		label: "Person",
		trigger: "@",
		icon: UserIcon,
		tone: "info",
		suggestions: [
			{ id: "1", label: "Maria Petrova", description: "Operations" },
			{ id: "2", label: "Marcus Webb", description: "Finance" },
		],
	},
	booking: {
		label: "Booking",
		trigger: "#",
		icon: CalendarIcon,
		tone: "success",
		suggestions: [{ id: "4417", label: "Marlow Hall — 14 Aug" }],
	},
}

/** The registry every feed row looks its resources up in. One entry, many mentions. */
export const REGISTRY: Record<string, ActivityResourceConfig> = {
	"booking:4417": {
		label: "Marlow Hall — 14 Aug",
		icon: CalendarIcon,
		tone: "success",
		/* Not the status, which the row's sentence already states. */
		badge: { label: "Deposit due", tone: "warning" },
		tags: ["4 guests"],
		note: "Deposit outstanding.",
	},
	"order:9921": {
		label: "ORD-9921",
		icon: PackageIcon,
		tone: "primary",
		tags: ["€1,240"],
	},
}

export const ACTIVITIES: ActivityItem[] = [
	{
		id: "a1",
		event: "status_changed",
		source: "system",
		createdAt: ago(1),
		actor: { id: "u1", name: "Maria Petrova" },
		segments: [
			{ type: "actor", text: "Maria Petrova", actorId: "u1" },
			{ type: "text", text: "moved" },
			{ type: "resource", resource: { key: "booking:4417" } },
			{ type: "text", text: "to" },
			{ type: "status", text: "Confirmed", tone: "success" },
		],
		metadata: [
			{ label: "Channel", value: "Direct" },
			{ label: "Deposit", value: "€300" },
			{ label: "Nights", value: "2" },
			{ label: "Source", value: "Phone" },
		],
		changes: [
			{ key: "status", label: "Status", old: "Pending", new: "Confirmed" },
			{ key: "deposit", label: "Deposit", old: null, new: "€300" },
			{ key: "notes", label: "Notes", description: "Recalculated from the rate plan." },
		],
		resources: [{ key: "booking:4417" }, { key: "order:9921" }],
	},
	{
		id: "a2",
		event: "mail_bounced",
		source: "mail",
		createdAt: ago(5),
		headline: "Confirmation email to ops@northwind.test bounced",
		description: "The mailbox is over quota. The message will not be retried automatically.",
	},
	{
		id: "a3",
		event: "assigned",
		source: "system",
		createdAt: ago(30),
		actor: { id: "u2", name: "Marcus Webb" },
		segments: [
			{ type: "actor", text: "Marcus Webb", actorId: "u2" },
			{ type: "text", text: "assigned" },
			{ type: "resource", resource: { key: "order:9921" } },
			{ type: "text", text: "to" },
			{ type: "value", text: "Maria Petrova" },
		],
	},
	{
		id: "a4",
		event: "created",
		source: "system",
		createdAt: ago(54),
		actor: { id: "u1", name: "Maria Petrova" },
		headline: "Maria Petrova created the booking",
	},
]

/** A comment and an event, already in the log's shape. */
export const LOG_ENTRIES: ActivityLogEntry<CommentUser, unknown, Kind>[] = [
	{
		id: "c1",
		kind: "comment",
		timestamp: ago(3),
		comment: {
			id: "c1",
			contentType: "html",
			content: `<p>Chased the deposit — <span data-ref-id="user:1" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria Petrova</span> is on it.</p>`,
			createdAt: ago(3),
			user: { id: "2", name: "Marcus Webb" },
			references: [{ id: "user:1", kind: "user", label: "Maria Petrova" }],
		},
	},
	{
		id: "e1",
		kind: "event",
		timestamp: ago(4),
		event: "status_changed",
		actor: "Maria Petrova",
		action: "moved the booking to",
		target: "Confirmed",
		label: "System",
		changes: [{ key: "status", label: "Status", old: "Pending", new: "Confirmed" }],
		actions: [
			{ id: "open", label: "Open booking", icon: ExternalLinkIcon, presentation: "menu" },
			{ id: "revert", label: "Revert", icon: RotateCwIcon, tone: "destructive", presentation: "menu" },
		],
	},
]

/** A raw audit row, in the app's own column names. */
export interface AuditRow {
	uuid: string
	at: string
	who: string
	verb: string
	subject: string
}

export const AUDIT: AuditRow[] = [
	{ uuid: "r1", at: ago(2), who: "Marcus Webb", verb: "refunded", subject: "ORD-9921" },
	{ uuid: "r2", at: ago(26), who: "System", verb: "reconciled", subject: "August payouts" },
]
