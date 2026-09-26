import { SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/base/buttons"
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	type CommandProps,
} from "@/components/base/command"
import { Text } from "@/components/base/typography"

import { ROUTE_GROUPS } from "../routes"
import styles from "../preview.module.css"

function routeSearchScore(value: string, search: string, keywords: string[] = []) {
	const needle = search.trim().toLowerCase()
	if (!needle) return 1
	const label = value.toLowerCase()
	if (label === needle) return 1
	if (label.includes(needle)) return 0.9
	const terms = needle.split(/\s+/)
	const fields = [label, ...keywords.map((keyword) => keyword.toLowerCase())]
	return terms.every((term) => fields.some((field) => field.includes(term))) ? 0.7 : 0
}

const filterRoutes: CommandProps["filter"] = routeSearchScore

/** The visible control and ⌘K / Ctrl-K open the same package-native command palette. */
export function SiteSearch() {
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault()
				setOpen((current) => !current)
			}
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [])

	const setDialogOpen = (next: boolean) => {
		setOpen(next)
		if (!next) setQuery("")
	}

	const go = (path: string) => {
		navigate(path)
		setDialogOpen(false)
	}

	/*
	 * cmdk ranks items within a group but keeps group order, so groups are ranked by their
	 * best route too; otherwise an earlier group's keyword match wins over an exact name.
	 */
	const rankedRouteGroups = query.trim()
		? ROUTE_GROUPS.map((routeGroup, index) => ({
				routeGroup,
				index,
				score: Math.max(
					...routeGroup.routes.map((route) =>
						routeSearchScore(route.label, query, [route.group, ...(route.section ? [route.section] : []), ...(route.keywords ?? [])]),
					),
				),
			}))
			.sort((left, right) => right.score - left.score || left.index - right.index)
			.map(({ routeGroup }) => routeGroup)
		: ROUTE_GROUPS

	return (
		<div className={styles.search}>
			<Button
				tone="neutral"
				buttonStyle="outline"
				className={styles.searchTrigger}
				aria-label="Search components"
				onClick={(event) => {
					if (event.defaultPrevented) return
					// Establish the native dialog's return focus on Safari pointer clicks.
					event.currentTarget.focus({ preventScroll: true })
					setOpen(true)
				}}
			>
				<SearchIcon />
				<span className={styles.searchTriggerLabel}>Search components…</span>
				<kbd className={styles.searchHint}>⌘K</kbd>
			</Button>

			<CommandDialog
				open={open}
				onOpenChange={setDialogOpen}
				title="Search components"
				description="Search documentation by component, category, or concept."
				className={styles.searchDialog}
				commandProps={{ filter: filterRoutes }}
			>
				<CommandInput
					value={query}
					onValueChange={setQuery}
					placeholder="Search components…"
				/>
				<CommandList>
					<CommandEmpty>No matching component or guide.</CommandEmpty>
					{rankedRouteGroups.map((routeGroup) => (
						<CommandGroup key={routeGroup.label} heading={routeGroup.label}>
							{routeGroup.routes.map((route) => (
								<CommandItem
									key={route.path}
									value={route.label}
									keywords={[route.group, ...(route.section ? [route.section] : []), ...(route.keywords ?? [])]}
									onSelect={() => go(route.path)}
								>
									<Text tag="span" size="sm" weight="medium">
										{route.label}
									</Text>
									{/* The section only; the group is already the heading. */}
									{!!route.section && (
										<Text
											tag="span"
											type="secondary"
											size="xs"
											className={styles.searchItemMeta}
										>
											{route.section}
										</Text>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					))}
				</CommandList>
			</CommandDialog>
		</div>
	)
}
