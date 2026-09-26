import { useMemo, useState } from "react"

import { Switch } from "themelia-ui/base/choice-inputs"
import { Text } from "themelia-ui/base/typography"
import { GlobalSearch, type GlobalSearchIdleSection } from "themelia-ui/features/global-search"

import { match } from "./_shared"
import { GROUP_LABELS, IDLE, type Group } from "./data"

export default function Panel() {
	const [query, setQuery] = useState("marlow")
	const [loading, setLoading] = useState(false)
	const [chosen, setChosen] = useState<string | null>(null)

	const results = useMemo(() => match(query), [query])

	/* Choosing a recent query or a suggestion searches for it. */
	const idle = useMemo<GlobalSearchIdleSection[]>(
		() =>
			IDLE.map((section) => ({
				...section,
				items: section.items.map((item) => ({
					...item,
					onSelect: () => setQuery(String(item.label)),
				})),
			})),
		[],
	)

	return (
		<>
			<Switch label="Simulate loading" checked={loading} onChange={event => setLoading(event.target.checked)} />
			<GlobalSearch<Group>
				loading={loading}
				query={query}
				onQueryChange={setQuery}
				results={results}
				groupLabels={GROUP_LABELS}
				idleSections={idle}
				onResultSelect={(result) => setChosen(result.title)}
			/>
			{!!chosen && (
				<Text size="sm" type="secondary">opened: {chosen}</Text>
			)}
		</>
	)
}
