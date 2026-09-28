import {
	BuildingIcon, CalendarIcon, CircleCheckIcon, CircleDashedIcon, CircleXIcon, TagIcon,
	UsersIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import {
	FilterLayout, FilterProvider, FilterType, defineAsyncSelectConfig,
	serializeFiltersToQuery, type ActiveFilter, type FilterConfig, type FilterTab,
} from "themelia-ui/features/filters"

const VENUES = [
	{ id: "v-1", name: "Marlow Hall" },
	{ id: "v-2", name: "The Old Granary" },
	{ id: "v-3", name: "Riverside Rooms" },
	{ id: "v-4", name: "Sattersby Barn" },
]

const FILTERS: FilterConfig[] = [
	{
		key: "q",
		label: "Search",
		type: FilterType.SEARCH,
		placeholder: "Search bookings…",
		delay: 250,
	},
	{
		key: "status",
		label: "Status",
		pluralLabel: "statuses",
		type: FilterType.MULTI_SELECT,
		icon: <CircleCheckIcon />,
		displayConfig: { display: "always", priority: 0 },
		options: [
			{ value: "confirmed", label: "Confirmed", icon: <CircleCheckIcon /> },
			{ value: "pending", label: "Pending", icon: <CircleDashedIcon /> },
			{ value: "cancelled", label: "Cancelled", icon: <CircleXIcon /> },
		],
	},
	{
		key: "venue",
		label: "Venue",
		pluralLabel: "venues",
		type: FilterType.ASYNC_SELECT,
		icon: <BuildingIcon />,
		multiple: true,
		displayConfig: { priority: 1 },
		asyncConfig: defineAsyncSelectConfig({
			// Stands in for the app's own endpoint.
			fetcher: async ({ query }) => {
				await new Promise((resolve) => setTimeout(resolve, 250))
				return VENUES.filter((venue) =>
					venue.name.toLowerCase().includes(query.toLowerCase()),
				)
			},
			mapToOption: (venue) => ({ value: venue.id, label: venue.name }),
		}),
	},
	{
		key: "date",
		label: "Date",
		type: FilterType.DATE,
		icon: <CalendarIcon />,
		operator: "between",
		displayConfig: { priority: 2 },
	},
	{
		key: "guests",
		label: "Guests",
		type: FilterType.RANGE,
		icon: <UsersIcon />,
		operator: "between",
		displayConfig: { priority: 3 },
	},
	{
		key: "tags",
		label: "Tag",
		pluralLabel: "tags",
		type: FilterType.TAGS,
		icon: <TagIcon />,
		displayConfig: { priority: 4 },
	},
]

const TABS: FilterTab[] = [
	{ id: "all", label: "All", presets: [] },
	{
		id: "confirmed",
		label: "Confirmed",
		count: 24,
		presets: [{ key: "status", value: ["confirmed"] }],
	},
	{
		id: "needs-attention",
		label: "Needs attention",
		count: 3,
		presets: [{ key: "status", value: ["pending", "cancelled"] }],
	},
]

export default function Filters() {
	const [navigating, setNavigating] = useState(false)
	const [active, setActive] = useState<ActiveFilter[]>([
		{ id: "status", key: "status", operator: "equals", value: ["confirmed"] },
	])

	const query = useMemo(
		() => serializeFiltersToQuery(FILTERS, active),
		[active],
	)

	return (
		<>
			<Stack direction="horizontal" gap="sm">
				<Button tone="neutral" appearance="outline" onClick={() => setNavigating((current) => !current)}>
					{navigating ? "Resume filtering" : "Show pending state"}
				</Button>
			</Stack>
			<FilterProvider
				filters={FILTERS}
				activeFilters={active}
				onFilterChange={setActive}
				navigating={navigating}
			>
				<FilterLayout tabs={TABS} showClearFilters />
			</FilterProvider>

			<Text size="xs" type="secondary" numeric>
				{Object.keys(query).length === 0
					? "no filters applied"
					: new URLSearchParams(
							Object.entries(query).flatMap(([key, value]) =>
								Array.isArray(value)
									? value.map((entry) => [key, entry] as [string, string])
									: [[key, String(value)] as [string, string]],
							),
						).toString()}
			</Text>
		</>
	)
}
