/**
 * The add-filter button and its two-step popup: the unapplied filters, then the chosen
 * filter's editor with a way back (not nested submenus, which close under a date picker).
 */
import { ListFilterIcon } from "lucide-react"

import { Button, TooltipButton } from "@/components/base/buttons"
import {
	Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/base/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Text } from "@/components/base/typography"

import { FilterEditor } from "./filter-editors"
import { useFilters, useFilterTransientState } from "./filter-store"
import { FilterType, type FilterConfig } from "./filters.types"
import styles from "./filters.module.css"

export interface FiltersButtonProps {
	/** Filters with no value yet. */
	availableFilters: FilterConfig[]
	/** Icon-only is the compact toolbar default; visible suits a standalone call to action. */
	labelVisibility?: "hidden" | "visible"
	className?: string
}

export function FiltersButton({ availableFilters, labelVisibility = "hidden", className }: FiltersButtonProps) {
	const { strings, getFilterValue, setFilterValue, isNavigating } = useFilters()
	const [open, setOpen] = useFilterTransientState(false)
	const [editing, setEditing] = useFilterTransientState<FilterConfig | null>(null)
	const trigger = labelVisibility === "hidden" ? (
		<TooltipButton
			type="button"
			tone="neutral"
			buttonStyle="outline"
			iconOnly
			tooltip={strings.addFilter}
			side="bottom"
			className={className}
		>
			<ListFilterIcon />
		</TooltipButton>
	) : (
		<Button
			type="button"
			tone="neutral"
			buttonStyle="outline"
			className={className}
		>
			<ListFilterIcon />
			{strings.addFilter}
		</Button>
	)

	return (
		<Popover
			open={open && !isNavigating}
			onOpenChange={(next) => {
				setOpen(next)
				// Closing returns to the list, so reopening never lands mid-edit.
				if (!next) setEditing(null)
			}}
		>
			<PopoverTrigger
				disabled={isNavigating}
				render={trigger}
			/>

			<PopoverContent align="start" inset="flush" className={styles.editorPopover}>
				{editing ? (
					<FilterEditor
						filter={editing}
						value={getFilterValue(editing.key)}
						onValueChange={(value) => setFilterValue(editing.key, value)}
						onBack={() => setEditing(null)}
						onClose={() => setOpen(false)}
						triggerSource="toolbar"
					/>
				) : (
					<Command>
						<CommandInput placeholder={strings.searchFilters} />
						<CommandList className={styles.editorList}>
							<CommandEmpty>{strings.noFiltersAvailable}</CommandEmpty>
							<CommandGroup heading={strings.availableFilters}>
								{availableFilters.map((filter) => (
									<CommandItem
										key={filter.key}
										value={filter.label}
										onSelect={() => setEditing(filter)}
									>
										{filter.icon}
										<span className={styles.optionBody}>
											<Text tag="span">{filter.label}</Text>
											<Text tag="span" size="xs" type="secondary">
												{filter.type === FilterType.DATE
													? strings.selectDate
													: filter.options
														? strings.options(filter.options.length)
														: (filter.description ?? "")}
											</Text>
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				)}
			</PopoverContent>
		</Popover>
	)
}
