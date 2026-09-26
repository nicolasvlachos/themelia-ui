import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Select } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { DataView } from "themelia-ui/features/data-view"
import type { ActiveFilter } from "themelia-ui/features/filters"

import styles from "../../preview.module.css"
import { FILTERS, indexColumns } from "./_shared"
import { BOOKINGS, TABS, type Booking } from "./data"

export default function DataViewStates() {
	const [requestState, setRequestState] = useState("ready")
	const [recoveryFilters, setRecoveryFilters] = useState<ActiveFilter[]>([])

	return (
		<>
			<Stack direction="horizontal" align="center" gap="sm" wrap>
				<Text size="sm" type="secondary">Result state</Text>
				<Select aria-label="Result state" value={requestState} className={styles.featureStateSelect}
					options={[{ value: "ready", label: "Ready" }, { value: "pending", label: "Updating" }, { value: "error", label: "Failed" }]}
					onValueChange={(value) => value && setRequestState(value)} />
				{requestState === "error" && <Button tone="neutral" buttonStyle="outline" onClick={() => setRequestState("ready")}>Restore results</Button>}
			</Stack>
			<DataView<Booking> data={BOOKINGS.slice(0, 3)} columns={indexColumns}
				filtering={{ filters: FILTERS, activeFilters: recoveryFilters, onFilterChange: setRecoveryFilters,
					tabs: TABS, isFiltering: requestState === "pending",
					filterRows: requestState === "error" ? () => { throw new Error("Preview matcher failure") } : undefined,
				}}
				table={{ getRowId: (row) => row.id, emptyStateMessage: "No bookings match your filters",
					emptyStateAction: <Button tone="neutral" buttonStyle="outline" onClick={() => setRecoveryFilters([])}>Clear filters</Button> }} />
		</>
	)
}
