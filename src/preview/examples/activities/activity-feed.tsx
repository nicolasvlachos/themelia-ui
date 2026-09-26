import { useState } from "react"
import { ExternalLinkIcon, RotateCwIcon } from "lucide-react"

import { PillRadioGroup, Select } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { ActivityFeed, type ActivityDensity } from "themelia-ui/features/activities"

import styles from "./activities.module.css"
import { ACTIVITIES, REGISTRY } from "./data"

export default function ActivityFeedExample() {
	const [density, setDensity] = useState<ActivityDensity>("rich")
	const [activities, setActivities] = useState(ACTIVITIES)
	const [feedState, setFeedState] = useState("ready")
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
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
				<Select aria-label="Feed state" value={feedState} className={styles.stateSelect}
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
						<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
					))}
				</Stack>
			)}
		</>
	)
}
