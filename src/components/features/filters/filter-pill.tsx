/**
 * One filter, as a pill: a `role="group"` of segment buttons (open the values, change the
 * comparison, remove), with the chrome on the group.
 *
 * The popup anchors to an inert span mirroring the whole pill (`pointer-events: none`),
 * and the segments open it by hand.
 */
import { XIcon } from "lucide-react"
import { useRef } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { FilterEditor } from "./filter-editors"
import { FilterOperatorSelect } from "./filter-operator-select"
import { FilterValueDisplay } from "./filter-value-display"
import { useFilters, useFilterTransientState } from "./filter-store"
import type { FilterConfig, FilterOperator, OperatorOption } from "./filters.types"
import styles from "./filters.module.css"

export interface FilterPillProps {
	filter: FilterConfig
	value: string[]
	/** Whether the filter currently applies. Drives the clear segment. */
	active: boolean
	operator: FilterOperator
	operators: OperatorOption[]
	onOperatorChange: (operator: FilterOperator) => void
	onValueChange: (value: string[]) => void
	onClear: () => void
	className?: string
}

export function FilterPill({
	filter,
	value,
	active,
	operator,
	operators,
	onOperatorChange,
	onValueChange,
	onClear,
	className,
}: FilterPillProps) {
	const { strings, isNavigating } = useFilters()
	const [open, setOpen] = useFilterTransientState(false)

	/* Swallows the outside-press that closing the operator menu bubbles onto the pill; clears next tick. */
	const suppressOpen = useRef(false)

	return (
		<Popover
			open={open && !isNavigating}
			onOpenChange={(next) => {
				if (next && suppressOpen.current) return
				setOpen(next)
			}}
		>
			<div
				role="group"
				aria-label={filter.label}
				data-active={active || undefined}
				className={cx(
					"filter-pill--component",
					styles.pill,
					filter.displayConfig?.className,
					className,
				)}
			>
				<PopoverTrigger
					render={<span />}
					nativeButton={false}
					disabled={isNavigating}
					tabIndex={-1}
					aria-hidden="true"
					className={styles.pillAnchor}
				/>

				<button
					type="button"
					disabled={isNavigating}
					className={styles.segment}
					onClick={() => {
						if (!suppressOpen.current) setOpen(true)
					}}
				>
					{!!filter.icon && <span className={styles.pillIcon}>{filter.icon}</span>}
					<Text tag="span" weight="semibold">{filter.label}</Text>
				</button>

				<span aria-hidden className={styles.pillDivider} />

				<FilterOperatorSelect
					operator={operator}
					operators={operators}
					onOperatorChange={(next) => {
						suppressOpen.current = true
						onOperatorChange(next)
						setOpen(false)
						window.setTimeout(() => {
							suppressOpen.current = false
						}, 100)
					}}
				/>

				<span aria-hidden className={styles.pillDivider} />

				{/* The value opens the editor too: it is what the reader aims at. */}
				<button
					type="button"
					disabled={isNavigating}
					className={cx(styles.segment, styles.pillValue)}
					aria-label={`${strings.edit}: ${filter.label}`}
					onClick={() => {
						if (!suppressOpen.current) setOpen(true)
					}}
				>
					<FilterValueDisplay filter={filter} value={value} />
				</button>

				{active && (
					<>
						<span aria-hidden className={styles.pillDivider} />
						<button
							type="button"
							disabled={isNavigating}
							className={cx(styles.segment, styles.segmentClear)}
							aria-label={`${strings.clear}: ${filter.label}`}
							onClick={(event) => {
								event.stopPropagation()
								setOpen(false)
								onClear()
							}}
						>
							<XIcon aria-hidden className={styles.segmentGlyph} />
						</button>
					</>
				)}
			</div>

			<PopoverContent align="start" inset="flush" className={styles.editorPopover}>
				<FilterEditor
					filter={filter}
					value={value}
					onValueChange={onValueChange}
					onBack={() => setOpen(false)}
					onClose={() => setOpen(false)}
					triggerSource="chip"
				/>
			</PopoverContent>
		</Popover>
	)
}
