/** The comparison segment of a pill; plain text when there is only one operator. */
import { ChevronDownIcon } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/base/dropdown-menu"
import { Text } from "@/components/base/typography"

import { useFilters, useFilterTransientState } from "./filter-store"
import type { FilterOperator, OperatorOption } from "./filters.types"
import styles from "./filters.module.css"

export interface FilterOperatorSelectProps {
	operator: FilterOperator
	operators: OperatorOption[]
	onOperatorChange: (operator: FilterOperator) => void
}

export function FilterOperatorSelect({
	operator,
	operators,
	onOperatorChange,
}: FilterOperatorSelectProps) {
	const { strings, isNavigating } = useFilters()
	const [open, setOpen] = useFilterTransientState(false)
	const current = operators.find((option) => option.value === operator) ?? operators[0]

	if (operators.length <= 1) {
		return (
			<Text tag="span" type="secondary" className={styles.operatorStatic}>
				{current?.label}
			</Text>
		)
	}

	return (
		<DropdownMenu open={open && !isNavigating} onOpenChange={setOpen}>
			<DropdownMenuTrigger
				disabled={isNavigating}
				render={(triggerProps) => (
					<button
						{...triggerProps}
						type="button"
						aria-label={strings.operator}
						className={styles.segment}
						// Keeps a comparison pick from also opening the value editor.
						onClick={(event) => {
							event.stopPropagation()
							triggerProps.onClick?.(event)
						}}
					>
						<Text tag="span" type="secondary">{current?.label}</Text>
						<ChevronDownIcon aria-hidden className={styles.segmentGlyph} />
					</button>
				)}
			/>
			<DropdownMenuContent align="start">
				<DropdownMenuRadioGroup
					value={operator}
					onValueChange={(next) => {
						onOperatorChange(next as FilterOperator)
						setOpen(false)
					}}
				>
					{operators.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
