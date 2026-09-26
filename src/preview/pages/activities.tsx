import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ActivitiesPage() {
	return (
		<ComponentPage>
			<Example
				example="activities/activity-feed"
				title="ActivityFeed"
				description="Scan the headline first, with time and source on a separate line. Use Show details to compare changes, inspect context, and open related records in distinct sections. Compact and default views keep the same event data with fewer details on screen."
			/>

			<Example
				example="activities/activity-log"
				title="ActivityLog"
				description="Events and comments interleaved on one rail. Rendering them as two lists produces two timelines that disagree about what happened when, and a reader has to merge them by eye. Here a comment is an activity whose row happens to be a CommentItem — same marker column, same date grouping, same ordering."
				overflowing
			/>

			<Example
				id="activity-adapter"
				title="createActivityEventAdapter"
				description="Every app has one audit table with its own column names, and the mapping is written once and used in twenty places. Writing it as accessors rather than a function body makes the mapping data — composable, partially overridable, and readable at a glance to see which fields an app populates. The two Audit rows in the log above came through it."
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

			<Example id="activity-vocabulary" title="What the small things mean">
				<Callout label="Shape is the kind">
					A record is a pill <strong>with an icon</strong> — the same glyph everywhere that
					record appears, whatever state it is in. A state is a badge with{" "}
					<strong>no icon</strong>. That is the whole difference, and it is why a reader can
					tell a booking from a status without reading either.
				</Callout>
				<Callout label="Colour is the state, and nothing else">
					A tone means &ldquo;this is what the thing became&rdquo;. Nothing else in the
					sentence carries colour, because the moment two things are green for two reasons
					the colour stops saying anything. A resource chip in its <em>type&rsquo;s</em>{" "}
					tone would put a green booking beside a green <code>Confirmed</code> in one line,
					while the marker and the rail carry a third tone for the event — so{" "}
					<code>ActivityResourceConfig.tone</code> colours the chip&rsquo;s glyph, where a
					type belongs.
				</Callout>
				<Callout label="The source is not a chip">
					Which system emitted an event is a fact about the <em>event</em>, like its time —
					the same answer on every row from that system, and nothing a reader acts on. As a
					neutral badge at the end of the sentence it would be the same shape as the state
					badge beside it, and <code>to Confirmed System</code> would read as two states. It
					sits with the time instead: pass <code>source</code> on the item.
				</Callout>
			</Example>

			<Example id="activity-rule" title="When a row is a button">
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
				<PropTable owners={["ActivityFeed", "ActivityLog", "ActivityItem"]} />
				<PropTable
					symbols={[
						"ActivityRow",
						"ActivityHeadline",
						"ActivityMarker",
						"ActivityDateLabel",
						"ActivityChanges",
						"ActivityResourceTag",
						"ActivityActionsMenu",
						"ActivityExpandToggle",
						"ActivityEmptyState",
						"useActivityResources",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
