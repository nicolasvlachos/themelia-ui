/** Saved filter sets, as a tab row. A tab is active only when exactly its presets are applied. */
import { OverflowTabBar } from "@/components/base/navigation"
import { Badge } from "@/components/base/badge"
import { Select } from "@/components/base/choice-inputs"
import { cx } from "@/lib/cx"

import { getDefaultOperatorForType } from "./filter-operators"
import { useFilters } from "./filter-store"
import type { ActiveFilter, FilterTab } from "./filters.types"
import styles from "./filters.module.css"

export interface FilterTabsProps {
	tabs: FilterTab[]
	/** Compact saved-view control using the same presets and matching as the tab row. */
	display?: "tabs" | "select"
	/** Accessible name for either presentation. */
	label?: string
	className?: string
}

function presetsToFilters(
	tab: FilterTab,
	getType: (key: string) => ActiveFilter["operator"],
): ActiveFilter[] {
	return tab.presets
		.filter((preset) => preset.value.length > 0)
		.map((preset) => ({
			id: preset.key,
			key: preset.key,
			operator: preset.operator ?? getType(preset.key),
			value: preset.value,
		}))
}

export function FilterTabs({ tabs, display = "tabs", label, className }: FilterTabsProps) {
	const { activeFilters, filters, replaceFilters, isNavigating, strings } = useFilters()

	const operatorFor = (key: string) => {
		const config = filters.find((filter) => filter.key === key)
		return config
			? (config.operator ??
					config.operators?.[0]?.value ??
					getDefaultOperatorForType(config.type))
			: "equals"
	}

	const activeTab = tabs.find((tab) => {
		const wanted = presetsToFilters(tab, operatorFor)
		if (wanted.length !== activeFilters.length) return false
		return wanted.every((preset) =>
			activeFilters.some(
				(active) =>
					active.key === preset.key &&
					active.operator === preset.operator &&
					JSON.stringify(preset.operator === "between" ? active.value : [...active.value].sort()) ===
						JSON.stringify(preset.operator === "between" ? preset.value : [...preset.value].sort()),
			),
		)
	})
	const selectView = (id: string | undefined) => {
		if (isNavigating) return
		const tab = tabs.find((entry) => entry.id === id)
		if (tab) replaceFilters(presetsToFilters(tab, operatorFor))
	}

	if (display === "select") {
		return <Select
			aria-label={label ?? strings.savedViews}
			value={activeTab?.id ?? null}
			placeholder={strings.customView}
			options={tabs.map((tab) => ({ value: tab.id, label: tab.label }))}
			onValueChange={selectView}
			disabled={isNavigating}
			className={cx("filter-tabs--component", styles.viewSelect, className)}
		/>
	}

	return (
		<OverflowTabBar
			value={activeTab?.id}
			onValueChange={selectView}
			strings={{ label: label ?? strings.savedViews }}
			items={tabs.map((tab) => ({
				id: tab.id,
				label: tab.label,
				disabled: isNavigating,
				badge:
					tab.count === undefined ? undefined : <Badge tone="neutral">{tab.count}</Badge>,
			}))}
			className={cx("filter-tabs--component", className ?? styles.tabs)}
		/>
	)
}
