export interface ActivitiesStrings {
	title: string
	empty: string
	/** A second line under the empty title. Empty hides it. */
	emptyHint: string
	loading: string
	refreshing: string
	error: string
	refreshError: string
	retry: string
	today: string
	yesterday: string
	/** The group label for an entry with no timestamp. */
	undated: string
	/** Substituted for the viewer's own name. */
	you: string
	showChanges: string
	hideChanges: string
	/** Captions inside an expanded event. */
	changesTitle?: string
	metadataTitle?: string
	resourcesTitle?: string
	actionsLabel: string
	/** For a count of hidden metadata entries: "+2 more". */
	moreLabel: string
	/** `source` → label and `event` → label, merged one level deep. An empty string hides the badge. */
	sources: Record<string, string>
	events: Record<string, string>
}

export const defaultActivitiesStrings: ActivitiesStrings = {
	title: "Activity",
	empty: "No activity yet.",
	emptyHint: "Changes to this record will show up here.",
	loading: "Loading activity…",
	refreshing: "Updating activity…",
	error: "Could not load activity",
	refreshError: "Could not update activity",
	retry: "Try again",
	today: "Today",
	yesterday: "Yesterday",
	undated: "Undated",
	you: "You",
	showChanges: "Show details",
	hideChanges: "Hide details",
	changesTitle: "Changes",
	metadataTitle: "Context",
	resourcesTitle: "Related records",
	actionsLabel: "Activity actions",
	moreLabel: "more",
	sources: {
		comment: "Comment",
		mail: "Mail",
		system: "System",
		// Deliberately empty: on an activity log, "Activity log" says nothing.
		activity_log: "",
	},
	events: {},
}

/** Merges string overrides, taking `sources` and `events` one level deep so one label can change alone. */
export function resolveActivitiesStrings(
	overrides?: Partial<ActivitiesStrings>,
): ActivitiesStrings {
	return {
		...defaultActivitiesStrings,
		...overrides,
		sources: { ...defaultActivitiesStrings.sources, ...overrides?.sources },
		events: { ...defaultActivitiesStrings.events, ...overrides?.events },
	}
}
