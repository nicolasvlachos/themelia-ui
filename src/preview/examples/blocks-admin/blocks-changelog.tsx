import { ChangelogTimeline, type ChangelogEntry } from "themelia-ui/patterns/timelines"

const CHANGELOG: ChangelogEntry[] = [
	{
		id: "1",
		kind: "added",
		title: "Saved views on the data table",
		description: "A view captures filters, column order and page size.",
		version: "v3.4.0",
		timestamp: "16 Aug",
		author: "Alice Mercer",
	},
	{
		id: "2",
		kind: "fixed",
		title: "Sheet no longer traps focus after a nested dialog closes",
		version: "v3.3.2",
		timestamp: "12 Aug",
	},
	{
		id: "3",
		kind: "modified",
		title: "Badge tones renamed to the semantic set",
		description: "The default and error tones are gone; use neutral and destructive.",
		version: "v3.3.0",
		timestamp: "4 Aug",
	},
	{
		id: "4",
		kind: "removed",
		title: "The legacy size prop on Metric",
		version: "v3.3.0",
		timestamp: "4 Aug",
	},
]

export default function BlocksChangelog() {
	return (
		<ChangelogTimeline entries={CHANGELOG} />
	)
}
