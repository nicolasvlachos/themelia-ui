import { useMemo, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { GlobalSearchDialog, type GlobalSearchIdleSection } from "themelia-ui/features/global-search"

import { match } from "./_shared"
import { GROUP_LABELS, IDLE, type Group } from "./data"

export default function Dialog() {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
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
			<Stack direction="horizontal" gap="md" align="center">
				<Button type="button" onClick={() => setOpen(true)}>Open the palette</Button>
				<Text size="sm" type="secondary">Then press Escape, or click outside it.</Text>
			</Stack>
			<GlobalSearchDialog<Group>
				open={open}
				onOpenChange={setOpen}
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
