import { useMemo, useState } from "react"
import {
	BuildingIcon, CalendarIcon, FileTextIcon, HashIcon, MapPinIcon, ReceiptIcon,
} from "lucide-react"

import { Switch } from "@/components/base/choice-inputs"
import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	GlobalSearch, GlobalSearchDialog,
	type GlobalSearchIdleSection, type GlobalSearchResult,
} from "@/components/features/global-search"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

type Group = "people" | "bookings" | "invoices" | "files"

const GROUP_LABELS: Record<Group, string> = {
	people: "People",
	bookings: "Bookings",
	invoices: "Invoices",
	files: "Files",
}

const RESULTS: GlobalSearchResult<Group>[] = [
	{
		id: "p-1",
		group: "people",
		title: "Marlow Chen",
		subtitle: "Operations",
		avatar: { initials: "MC" },
		meta: [{ icon: <MapPinIcon />, label: "Sattersby" }],
		timestamp: "seen 2h ago",
	},
	{
		id: "p-2",
		group: "people",
		title: "Marla Okonkwo",
		subtitle: "Finance",
		avatar: { initials: "MO" },
		badge: { label: "Admin", tone: "neutral" },
	},
	{
		id: "b-1",
		group: "bookings",
		title: "Marlow Hall — autumn showcase",
		subtitle: "180 seated",
		thumbnail: { icon: <BuildingIcon /> },
		meta: [
			{ icon: <CalendarIcon />, label: "14 Oct" },
			{ icon: <HashIcon />, label: "BK-4417", mono: true },
		],
		badge: { label: "Confirmed", tone: "success" },
		rightValue: "€12,400",
		rightLabel: "Total",
	},
	{
		id: "b-2",
		group: "bookings",
		title: "Marlow Hall — rehearsal",
		thumbnail: { icon: <BuildingIcon />, tone: "neutral" },
		meta: [{ icon: <CalendarIcon />, label: "13 Oct" }],
		badge: { label: "Pending", tone: "warning" },
		rightValue: "€300",
		rightLabel: "Deposit",
	},
	{
		id: "i-1",
		group: "invoices",
		title: "INV-2291 — Marlow Hall",
		subtitle: "Issued 2 Sep",
		thumbnail: { icon: <ReceiptIcon /> },
		meta: [{ label: "Net 30" }],
		badge: { label: "Overdue", tone: "destructive" },
		rightValue: "€12,400",
		rightLabel: "Due",
	},
	{
		id: "f-1",
		group: "files",
		title: "marlow-floorplan.pdf",
		subtitle: "Uploaded by Alice",
		thumbnail: { icon: <FileTextIcon />, tone: "neutral" },
		tags: ["floorplan", "venue"],
		timestamp: "3 days ago",
	},
]

const IDLE: GlobalSearchIdleSection[] = [
	{
		id: "recent",
		label: "Recent",
		items: [
			{ id: "r-1", label: "overdue invoices" },
			{ id: "r-2", label: "Marlow Hall" },
		],
	},
	{
		id: "suggestions",
		label: "Suggestions",
		items: [
			{ id: "s-1", label: "Bookings this week" },
			{ id: "s-2", label: "Unassigned venues" },
		],
	},
]

/** Stands in for the app's search endpoint. */
function match(query: string): GlobalSearchResult<Group>[] {
	const needle = query.trim().toLowerCase()
	if (needle.length < 2) return []
	return RESULTS.filter((result) =>
		`${result.title} ${result.subtitle ?? ""}`.toLowerCase().includes(needle),
	)
}

export function GlobalSearchPage() {
	const [query, setQuery] = useState("marlow")
	const [dialogQuery, setDialogQuery] = useState("")
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [chosen, setChosen] = useState<string | null>(null)

	const results = useMemo(() => match(query), [query])
	const dialogResults = useMemo(() => match(dialogQuery), [dialogQuery])

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
		<ComponentPage
			title="Global search"
			summary="The command palette: one list across people, bookings, invoices, and files, walked with the arrow keys. It does not search — the query is controlled and the results are given, because debounce, endpoint, ranking, and permissions all belong to the app. What it owns is the part every palette shares."
			importPath="@/components/features/global-search"
			exports={["GlobalSearch", "GlobalSearchDialog", "useGlobalSearch",
				"GlobalSearchInput", "GlobalSearchTabs", "GlobalSearchResultRow", "GlobalSearchIdleState", "GlobalSearchEmptyState", "GlobalSearchFooter",
			]}
		>
			<Example
				id="panel"
				title="The panel"
				description="Type in the field, then use ↑ ↓ and Enter — the pointer moves the same highlight the keys do, so Enter always opens the row under the cursor. Results bucket by their group key; the tab strip and the group headings are both generated from what came back."
				stacked
				code={`<GlobalSearch<Group>
  query={query}
  onQueryChange={setQuery}
  results={results}
  loading={isFetching}
  groupLabels={{ people: "People", bookings: "Bookings" }}
  idleSections={recentAndSuggested}
  onResultSelect={(result) => navigate(result.data.href)}
/>`}
			>
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
			</Example>

			<Example
				id="dialog"
				title="The palette"
				description="The same panel in the kit's modal surface: focus lands in the field, Escape closes, and the backdrop dismisses. The dialog carries no chrome of its own — the panel already draws the card, and stacking both put a border inside a border."
				stacked
				code={`<GlobalSearchDialog
  open={open}
  onOpenChange={setOpen}
  query={query}
  onQueryChange={setQuery}
  results={results}
  onResultSelect={(result) => navigate(result.id)}
/>`}
			>
				<Stack direction="horizontal" gap="md" align="center">
					<Button type="button" onClick={() => setOpen(true)}>Open the palette</Button>
					<Text size="sm" type="secondary">Then press Escape, or click outside it.</Text>
				</Stack>
				<GlobalSearchDialog<Group>
					open={open}
					onOpenChange={setOpen}
					query={dialogQuery}
					onQueryChange={setDialogQuery}
					results={dialogResults}
					groupLabels={GROUP_LABELS}
					idleSections={IDLE.map(section => ({ ...section, items: section.items.map(item => ({ ...item, onSelect: () => setDialogQuery(String(item.label)) })) }))}
					onResultSelect={(result) => {
						setChosen(result.title)
					}}
				/>
			</Example>

			<Example id="search-rules" title="Where the regions come from" stacked>
				<Callout label="Rule">
					Exactly one of <strong>idle / loading / empty / results</strong> shows, resolved in
					that order. Idle holds until the query is longer than one character, because a single
					letter matches everything and answering it wastes a request — and empty needs the same
					two, so the reader never reads “no results” while still typing the first one.
				</Callout>
				<Text size="sm" type="secondary">
					A result carries a trailing figure twice in the markup: a wide row gives it its own
					column against the right edge, a narrow one puts it on its own line below the context. Both are
					rendered and a container query hides one, because which is right depends on the width
					of the <strong>row</strong>, which no amount of React knows.
				</Text>
				<Text size="sm" type="secondary">
					<code>useGlobalSearch</code> is the state without the panel: the same{" "}
					<code>flat</code> list the keys walk and the rows are drawn from, so a row can never
					highlight one entry while Enter opens another.
				</Text>
			</Example>

			<Example id="search-api" title="API">
				<PropTable owner="GlobalSearch"
					rows={[
						{ name: "query / onQueryChange", type: "string / (q) => void", required: true, description: "Controlled, always. The palette never searches — it renders what it is given." },
						{ name: "results", type: "GlobalSearchResult[]", description: "One shape for every kind, with optional parts: avatar OR thumbnail, a badge, meta, tags, a timestamp, a trailing figure. A union per kind would be honest about the data and useless for a list that renders them all the same way." },
						{ name: "result.group", api: "GlobalSearchResult.group", type: "string", required: true, description: "The bucket. Tabs and group headings are both generated from the groups that actually returned something." },
						{ name: "groupLabels", type: "Partial<Record<group, ReactNode>>", description: "Names a group. Without it the raw key shows, which is a useful default only while you are wiring it up." },
						{ name: "loading", type: "boolean", description: "Swaps the input's clear control for a spinner and shows the loading region. Hidden results cannot be selected while the loading region is visible." },
						{ name: "idleSections", type: "GlobalSearchIdleSection[]", description: "Recent queries and curated suggestions. The palette has no memory of its own — whose recents these are is a question only the app can answer." },
						{ name: "tabs", type: "GlobalSearchTab[]", description: "Replaces the generated “All + one per group” strip, for a fixed set of tabs that should not appear and disappear with the results." },
						{ name: "slots", type: "GlobalSearchSlots", description: "input, tabs, idle, empty, loading, footer, and renderResult — every region, replaceable one at a time." },
						{ name: "onResultSelect", type: "(result) => void", description: "Fires on click and on Enter, with the whole result including its free-form `data`." },
						{ name: "onClose", type: "() => void", description: "Escape. The dialog presentation wires this to closing itself; a panel embedded in a page usually wants it too." },
						{ name: "GlobalSearchDialog", type: "component", description: "The palette presentation over ActionDialog: focus trap, portal, scroll lock, and a dialog role — none of which a hand-rolled fixed backdrop has." },
						{ name: "useGlobalSearch", type: "hook", description: "grouped, tabCounts, activeTab, flat, activeIndex, and onKeyDown — for a palette whose markup is entirely yours." },
						{ name: "GlobalSearchInput", type: "component", description: "The search row. Thin on purpose \u2014 base Input already owns the leading icon, the clear and the sizing, so this only wires the palette\u2019s key handling to it." },
						{ name: "GlobalSearchTabs", type: "component", description: "The group filter strip, built on OverflowTabBar rather than Tabs: these narrow one list rather than switching between panels, and the distinction decides what the arrow keys do." },
						{ name: "GlobalSearchResultRow", type: "component", description: "One rich result \u2014 icon, title, context and shortcut. Exported so a consumer rendering their own groups keeps the row\u2019s highlight and keyboard behaviour." },
						{ name: "GlobalSearchIdleState / GlobalSearchEmptyState", type: "component", description: "Before there is anything to search, and after a search that found nothing. Idle shows recent queries and curated suggestions, both supplied by the consumer \u2014 the palette does not remember anything itself." },
						{ name: "GlobalSearchFooter", type: "component", description: "The keyboard-hint strip. It is the only place a reader is told which three keys the palette answers to." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
