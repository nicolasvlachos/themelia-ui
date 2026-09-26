import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Select } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { ActivityLog, createActivityEventAdapter } from "themelia-ui/features/activities"
import type { CommentUser } from "themelia-ui/features/comments"

import styles from "./activities.module.css"
import { AUDIT, LOG_ENTRIES, RESOURCES, type AuditRow, type Kind } from "./data"

// Pinned to the log's kind union, so the entries it produces line up with the rest.
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

const ENTRIES = [...LOG_ENTRIES, ...AUDIT.map(toEntry)]

export default function ActivityLogExample() {
	const [entries, setEntries] = useState(ENTRIES)
	const [logState, setLogState] = useState("ready")
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			<Stack direction="horizontal" gap="sm" wrap>
				<Button tone="neutral" buttonStyle="outline" onClick={() => setEntries([])} disabled={entries.length === 0}>Show empty log</Button>
				<Button tone="neutral" buttonStyle="outline" onClick={() => setEntries(ENTRIES)}>Restore sample</Button>
				<Select aria-label="Log state" value={logState} className={styles.stateSelect}
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

			{log.length > 0 && (
				<Stack gap="none">
					{log.map((line, index) => (
						<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
					))}
				</Stack>
			)}
		</>
	)
}
