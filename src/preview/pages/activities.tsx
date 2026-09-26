import { useState } from "react"
import { CalendarIcon, ExternalLinkIcon, PackageIcon, RotateCwIcon, UserIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { PillRadioGroup, Select } from "@/components/base/choice-inputs"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	ActivityFeed, ActivityLog, createActivityEventAdapter,
	type ActivityDensity, type ActivityItem, type ActivityLogEntry,
	type ActivityResourceConfig,
} from "@/components/features/activities"
import type { CommentUser } from "@/components/features/comments"
import type { MentionResource } from "@/components/features/mentions"

import { Callout } from "../partials/callout"
import styles from "../preview.module.css"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

type Kind = "user" | "booking"

const RESOURCES: Partial<Record<Kind, MentionResource<Kind>>> = {
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

/** The registry every row looks its resources up in. One entry, many mentions. */
const REGISTRY: Record<string, ActivityResourceConfig> = {
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

const NOW = Date.now()
const ago = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString()

const ACTIVITIES: ActivityItem[] = [
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

/* A raw audit row, and the adapter that maps it. */
interface AuditRow {
	uuid: string
	at: string
	who: string
	verb: string
	subject: string
}

const AUDIT: AuditRow[] = [
	{ uuid: "r1", at: ago(2), who: "Marcus Webb", verb: "refunded", subject: "ORD-9921" },
	{ uuid: "r2", at: ago(26), who: "System", verb: "reconciled", subject: "August payouts" },
]

// Pinned to the page's kind union, so the entries it produces line up with the rest.
const toEntry = createActivityEventAdapter<AuditRow, CommentUser, unknown, Kind>({
	id: (row) => row.uuid,
	timestamp: (row) => row.at,
	kind: () => "audit",
	event: (row) => row.verb,
	actor: (row) => row.who,
	action: (row) => row.verb,
	target: (row) => row.subject,
	source: () => "Audit",
})

const LOG_ENTRIES: ActivityLogEntry<CommentUser, unknown, Kind>[] = [
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
	...AUDIT.map(toEntry),
]

export function ActivitiesPage() {
	const [density, setDensity] = useState<ActivityDensity>("rich")
	const [log, setLog] = useState<string[]>([])
	const [entries, setEntries] = useState(LOG_ENTRIES)
	const [activities, setActivities] = useState(ACTIVITIES)
	const [feedState, setFeedState] = useState("ready")
	const [logState, setLogState] = useState("ready")

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<ComponentPage
			title="Activities"
			summary="What happened to a record, and who did it. ActivityFeed is the timeline of events; ActivityLog is the mixed one — events and comments on the same rail, with a composer. A headline is typed segments rather than a sentence, so the actor, the field, and the status each render as themselves."
			importPath="@/components/features/activities"
			exports={["ActivityFeed", "ActivityLog", "useActivityFeed", "createActivityEventAdapter",
				"ActivityRow", "ActivityHeadline", "ActivityMarker", "ActivityDateLabel", "ActivityChanges", "ActivityResourceTag", "ActivityActionsMenu", "ActivityExpandToggle", "ActivityEmptyState", "useActivityResources",
			]}
		>
			<Example
				id="activity-feed"
				title="ActivityFeed"
				description="Scan the headline first, with time and source on a separate line. Use Show details to compare changes, inspect context, and open related records in distinct sections. Compact and default views keep the same event data with fewer details on screen."
				stacked
				code={`<ActivityFeed
  activities={activities}
  density="rich"
  loading={pending}
  error={loadError}
  onRetry={reloadHistory}
  currentUserId="u1"
  resources={registry}
  onActorClick={(actor) => open(actor)}
/>`}
			>
				<Stack direction="horizontal" gap="sm" wrap>
					<PillRadioGroup
						value={density}
						onValueChange={(next) => next && setDensity(next as ActivityDensity)}
						options={[
							{ value: "compact", label: "compact" },
							{ value: "default", label: "default" },
							{ value: "rich", label: "rich" },
						]}
					/>
					<Select aria-label="Feed state" value={feedState} className={styles.featureStateSelect}
						options={[
							{ value: "ready", label: "Loaded" }, { value: "refreshing", label: "Refreshing" },
							{ value: "error", label: "Refresh failed" }, { value: "loading", label: "Initial loading" },
							{ value: "initial-error", label: "Initial load failed" }, { value: "empty", label: "Empty" },
						]}
						onValueChange={(value) => value && setFeedState(value)} />
				</Stack>

				<ActivityFeed
					activities={["empty", "loading", "initial-error"].includes(feedState) ? [] : activities}
					loading={feedState === "refreshing" || feedState === "loading"}
					error={feedState === "error" || feedState === "initial-error" ? "The activity service is unavailable. Try again to reload history." : undefined}
					onRetry={() => setFeedState("ready")}
					density={density}
					currentUserId="u1"
					resources={REGISTRY}
					onActorClick={(actor) => note(`actor: ${actor.name}`)}
					onResourceClick={(resource) => note(`resource: ${resource.key}`)}
					actionsForActivity={(activity) =>
						activity.event === "mail_bounced"
							? [
									{ id: "resend", label: "Resend", icon: RotateCwIcon, presentation: "inline" },
									{ id: "open", label: "Open message", icon: ExternalLinkIcon },
								]
							: undefined
					}
					onAction={(actionId, activity) => {
						if (actionId === "resend") {
							setActivities((current) => current.map((item) =>
								item.id === activity.id
									? { ...item, event: "mail_sent", description: "The confirmation was delivered on retry." }
									: item,
							))
						}
						note(`${actionId} on ${activity.id}`)
					}}
				/>

				{log.length > 0 && (
					<Stack gap="none">
						{log.map((line, index) => (
							<Text key={`${line}-${index}`} size="xs" type="secondary">
								{line}
							</Text>
						))}
					</Stack>
				)}
			</Example>

			<Example
				id="activity-log"
				title="ActivityLog"
				description="Events and comments interleaved on one rail. Rendering them as two lists produces two timelines that disagree about what happened when, and a reader has to merge them by eye. Here a comment is an activity whose row happens to be a CommentItem — same marker column, same date grouping, same ordering."
				stacked
				overflowing
				code={`<ActivityLog
  entries={entries}
  loading={pending}
  error={loadError}
  onRetry={reloadHistory}
  resources={resources}
  canModerate
  composer={{ enabled: true, context, onSubmit }}
/>`}
			>
				<Stack direction="horizontal" gap="sm" wrap>
					<Button tone="neutral" buttonStyle="outline" onClick={() => setEntries([])} disabled={entries.length === 0}>Show empty log</Button>
					<Button tone="neutral" buttonStyle="outline" onClick={() => setEntries(LOG_ENTRIES)}>Restore sample</Button>
					<Select aria-label="Log state" value={logState} className={styles.featureStateSelect}
						options={[{ value: "ready", label: "Loaded" }, { value: "loading", label: "Updating" }, { value: "error", label: "Failed" }]}
						onValueChange={(value) => value && setLogState(value)} />
				</Stack>
				<ActivityLog<CommentUser, unknown, Kind>
					entries={entries}
					loading={logState === "loading"}
					error={logState === "error" ? "The latest history could not be loaded. Your draft is still here." : undefined}
					onRetry={() => setLogState("ready")}
					resources={RESOURCES}
					canModerate
					composer={{
						enabled: true,
						context: { id: "4417", type: "booking" },
						placeholder: "Add a note to this booking…",
						onSubmit: (values, helpers) => {
							setEntries((prev) => [
								{
									id: `c-${Date.now()}`,
									kind: "comment" as const,
									timestamp: new Date().toISOString(),
									comment: {
										id: `c-${Date.now()}`,
										contentType: "html",
										content: values.content,
										createdAt: new Date().toISOString(),
										user: { id: "me", name: "You" },
										references: values.references,
									},
								},
								...prev,
							])
							helpers.reset()
						},
					}}
					onCommentDelete={(id) => setEntries((prev) => prev.filter((entry) => entry.id !== id))}
					onEventAction={(actionId, entry) => note(`${actionId} on ${entry.id}`)}
				/>
			</Example>

			<Example
				id="activity-adapter"
				title="createActivityEventAdapter"
				description="Every app has one audit table with its own column names, and the mapping is written once and used in twenty places. Writing it as accessors rather than a function body makes the mapping data — composable, partially overridable, and readable at a glance to see which fields an app populates. The last two rows above came through this."
				stacked
				code={`// Pinned to the page's kind union, so the entries it produces line up with the rest.
const toEntry = createActivityEventAdapter<AuditRow, CommentUser, unknown, Kind>({
  id: (row) => row.uuid,
  timestamp: (row) => row.at,
  kind: () => "audit",
  actor: (row) => row.who,
  action: (row) => row.verb,
  target: (row) => row.subject,
})

const entries = auditRows.map(toEntry)`}
			>
				<Text size="sm" type="secondary">
					Pure — no React, no framework — so it runs on a server render or in a worker.
					An entry labelled <code>comment</code> whose comment accessor returns nothing
					stays an event, because a comment row with an undefined body is worse than a
					mislabelled event.
				</Text>
			</Example>

			<Example id="activity-vocabulary" title="What the small things mean" stacked>
				<Callout label="Shape is the kind">
					A record is a pill <strong>with an icon</strong> — the same glyph everywhere that
					record appears, whatever state it is in. A state is a badge with{" "}
					<strong>no icon</strong>. That is the whole difference, and it is why a reader can
					tell a booking from a status without reading either.
				</Callout>
				<Callout label="Colour is the state, and nothing else">
					A tone means &ldquo;this is what the thing became&rdquo;. Nothing else in the
					sentence carries colour, because the moment two things are green for two reasons
					the colour stops saying anything. The resource chip used to take its{" "}
					<em>type&rsquo;s</em> tone, which put a green booking beside a green{" "}
					<code>Confirmed</code> in one line while the marker and the rail carried a third
					tone for the event. <code>ActivityResourceConfig.tone</code> still exists — it now
					colours the chip&rsquo;s glyph, where a type belongs.
				</Callout>
				<Callout label="The source is not a chip">
					Which system emitted an event is a fact about the <em>event</em>, like its time —
					the same answer on every row from that system, and nothing a reader acts on. As a
					neutral badge at the end of the sentence it was the same shape as the state badge
					beside it, so <code>to Confirmed System</code> read as two states. It sits with the
					time instead. Pass <code>source</code> on the item; nothing else changes.
				</Callout>
			</Example>

			<Example id="activity-rule" title="When a row is a button" stacked>
				<Callout label="Rule">
					<code>onActivityClick</code> makes a row clickable, but it only becomes a
					keyboard <code>button</code> when nothing inside it is focusable. A row holding
					a link, a chip, and a menu that also claims <code>role=&quot;button&quot;</code>{" "}
					puts a control inside a control — the reader tabbing through reaches the row
					before anything in it. So nested interactivity downgrades the row to a pointer
					affordance and everything inside stays reachable.
				</Callout>
			</Example>

			<Example id="activities-api" title="API">
				<PropTable owner="ActivityFeed"
					rows={[
						{ name: "activities", type: "ActivityItem[]", description: "In display order. Grouped by date as they come, not bucketed — bucketing would silently reorder a feed sorted by something other than date." },
						{ name: "loading", type: "boolean", description: "Shows initial loading for an empty feed, or an update status above existing rows. Keeps loaded details and composer drafts mounted. Also available on ActivityLog." },
						{ name: "error / onRetry", api: "ActivityFeedProps.error", type: "ReactNode / () => void", description: "Failure feedback with an optional retry action. A failed refresh keeps existing history visible; the consumer owns the request and its loading state. Also available on ActivityLog." },
						{ name: "segments", api: "ActivityItem.segments", type: "ActivityHeadlineSegment[]", description: "actor | field | value | status | resource | text. Preferred over `headline`: “Maria changed Status from Draft to Published” is a person, a field, and two values, and a template string cannot express that." },
						{ name: "headline", api: "ActivityItem.headline", type: "string", description: "The fallback. The actor's name is split out of it so a feed migrated from a system that only stored sentences still gets a clickable actor." },
						{ name: "density", type: '"compact" | "default" | "rich"', default: '"default"', description: "How much of a row is drawn. rich adds metadata, changes, resources, and actions." },
						{ name: "itemSpacing", type: '"compact" | "default" | "relaxed"', default: '"default"', description: "The rhythm between rows, independent of how much each row draws." },
						{ name: "eventConfig", type: "Record<string, { icon, tone, label }>", description: "Merged over the kit's defaults, so one event can be redefined without restating the rest. Every `status_changed` in an application should look the same; deciding per call site guarantees it eventually does not." },
						{ name: "resources / onResourcesChange", type: "Record<key, config> / (registry) => void", description: "The registry rows look their resources up in. A hundred rows referencing order:1234 follow when it is renamed, and none of them stores the name." },
						{ name: "expandedIds / defaultExpandedIds", type: "string[]", description: "Controlled and uncontrolled. The change callback always gets the full id list, because a consumer persisting the set needs the set." },
						{ name: "currentUserId", type: "string", description: "Turns this person's own name into “You”. Both ids must be defined for the match, or a feed with no ids anywhere would call every actor “You”." },
						{ name: "slots", type: "{ renderRow, renderHeadline, renderMarker, renderDetails, … }", description: "renderRow returning undefined hands the row back to the feed — which is how ActivityLog replaces only its comment rows." },
						{ name: "ActivityLog entries", type: "ActivityLogEntry[]", required: true, description: "A union of comment entries and activity entries, sorted here. An entry with no timestamp sorts to the far end rather than shuffling." },
						{ name: "ActivityLog composer", type: "{ enabled, context, onSubmit, position }", description: "Omit to render the log read-only. inlineSubmit defaults to false here, unlike a standalone composer: a log's submit sits above a wall of history and one hidden on the toolbar reads as formatting." },
						{ name: "ActivityRow", type: "component", description: "One entry on the rail. Density changes the marker size and the row rhythm together \u2014 changing one without the other is what makes a compact feed look mis-aligned rather than dense." },
						{ name: "ActivityHeadline", type: "component", description: "The sentence, assembled from typed segments rather than interpolated. The fallback is the point: an event whose actor or subject is missing still reads as a sentence instead of rendering \u201cundefined updated\u201d." },
						{ name: "ActivityMarker / ActivityDateLabel", type: "component", description: "The dot on the rail and the time beside it. The marker knows whether it is last, because the connector below it is what tells a reader the run has ended." },
						{ name: "ActivityChanges / ActivityResourceTag", type: "component", description: "The before-and-after of an edit, and the chip naming what was edited. Changes render as pairs rather than prose so a long diff stays scannable." },
						{ name: "ActivityActionsMenu / ActivityExpandToggle / ActivityEmptyState", type: "component", description: "The row\u2019s overflow, the control that opens its detail, and the state with no events. The toggle is a real button rather than a clickable row, so a keyboard reader can reach it without traversing the entry." },
						{ name: "useActivityResources", type: "hook", description: "Resolves the resources an event refers to, so a feed can render a chip per subject without every consumer re-implementing the lookup and its cache." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
