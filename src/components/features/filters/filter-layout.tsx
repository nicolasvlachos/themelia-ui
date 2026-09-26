/**
 * FilterLayout — the default bar: saved tabs, search boxes, active pills, always-shown
 * pills, the add button, then Clear. For a custom bar, place the exported parts using
 * `useFilterGroups()`.
 */
import { Button } from "@/components/base/buttons"
import { LoadingState } from "@/components/base/feedback"
import { Spinner } from "@/components/base/spinner"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useIsMobile } from "@/hooks/use-mobile"

import { FilterPill } from "./filter-pill"
import { FilterSheet } from "./filter-sheet"
import { FilterTabs } from "./filter-tabs"
import { FiltersButton } from "./filters-button"
import { SearchFilters } from "./search-filters"
import { getOperatorsForType } from "./filter-operators"
import { useFilterGroups } from "./use-filter-groups"
import { useFilters } from "./filter-store"
import type { FilterConfig, FilterTab } from "./filters.types"
import styles from "./filters.module.css"

export interface FilterLayoutProps {
	className?: string
	/** Options loaded by the parent, keyed by filter. Overrides `filter.options`. */
	dynamicFilterOptions?: Record<string, FilterConfig["options"]>
	/** Per-filter pending state — a chip stands in while its options load. */
	loadingFilters?: Record<string, boolean>
	variant?: "default" | "compact"
	showClearFilters?: boolean
	tabs?: FilterTab[]
	/** Narrow viewports use a sheet; opt into inline controls for a custom mobile layout. */
	mobilePresentation?: "sheet" | "inline"
}

export function FilterLayout({
	className,
	dynamicFilterOptions,
	loadingFilters,
	variant = "default",
	showClearFilters = true,
	tabs,
	mobilePresentation = "sheet",
}: FilterLayoutProps) {
	const isMobile = useIsMobile()
	const mobile = isMobile && mobilePresentation === "sheet"
	const {
		getFilterValue, setFilterValue, isFilterActive, clearFilters,
		getFilterOperator, setFilterOperator, isNavigating, strings,
	} = useFilters()

	const groups = useFilterGroups({ dynamicFilterOptions })
	const sheetFilters = [...groups.activeFilters, ...groups.alwaysVisibleFilters, ...groups.popoverFilters]
		.sort((left, right) => (left.displayConfig?.priority ?? 0) - (right.displayConfig?.priority ?? 0) || groups.processedFilters.indexOf(left) - groups.processedFilters.indexOf(right))

	const operatorsFor = (filter: FilterConfig) =>
		filter.operators?.length ? filter.operators : getOperatorsForType(filter.type, strings.operators)

	const pill = (filter: FilterConfig) => (
		<FilterPill
			key={filter.key}
			filter={filter}
			value={getFilterValue(filter.key)}
			active={isFilterActive(filter.key)}
			operator={getFilterOperator(filter.key)}
			operators={operatorsFor(filter)}
			onOperatorChange={(operator) => setFilterOperator(filter.key, operator)}
			onValueChange={(value) => setFilterValue(filter.key, value)}
			onClear={() => setFilterValue(filter.key, [])}
		/>
	)

	return (
		<div
			data-slot="filter-layout"
			data-variant={variant}
			aria-busy={isNavigating || undefined}
			className={cx("filter-layout--component", styles.layout, className)}
		>
			{!!tabs?.length && <FilterTabs tabs={tabs} display={mobile ? "select" : "tabs"} />}

			{/* Dimmed and inert while a change applies (see `.bar[data-busy]`). */}
			<div className={styles.bar} data-mobile={mobile || undefined} data-busy={isNavigating || undefined}>
				<SearchFilters filters={groups.searchFilters} />
				{mobile ? sheetFilters.length > 0 && <FilterSheet filters={sheetFilters} loadingFilters={loadingFilters} showClearFilters={showClearFilters} /> : <>

				{Object.entries(loadingFilters ?? {})
					.filter(([, loading]) => loading)
					.map(([key]) => {
						const label = groups.processedFilters.find((filter) => filter.key === key)?.label ?? key
						return (
							<span key={`loading-${key}`} className={styles.loadingChip}>
								<Spinner />
								<Text tag="span" type="secondary">
									{strings.loadingOptions(label)}
								</Text>
							</span>
						)
					})}

				{groups.activeFilters.map(pill)}
				{groups.alwaysVisibleFilters.map(pill)}

				{groups.popoverFilters.length > 0 && (
					<FiltersButton availableFilters={groups.popoverFilters} />
				)}

				{showClearFilters && groups.hasActive && (
					<Button
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						disabled={isNavigating}
						onClick={clearFilters}
						className={styles.clear}
					>
						{strings.clearFilters}
					</Button>
				)}
				</>}
			</div>
			{isNavigating && <LoadingState label={strings.applying} className={styles.applying} />}
		</div>
	)
}
