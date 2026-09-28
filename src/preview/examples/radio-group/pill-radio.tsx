import { BuildingIcon, LayoutGridIcon, ListIcon } from "lucide-react"
import { useState } from "react"

import { PillRadioGroup } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"

const VIEWS = [
	{ value: "grid", label: "Grid", icon: LayoutGridIcon },
	{ value: "list", label: "List", icon: ListIcon },
	{ value: "board", label: "Board", icon: BuildingIcon },
]

export default function PillRadio() {
	const [view, setView] = useState<string | null>("grid")

	return (
		<Stack align="start">
			<PillRadioGroup name="view" options={VIEWS} value={view} onValueChange={setView} allowClear />
			<PillRadioGroup
				name="range"
				options={[
					{ value: "7d", label: "7 days" },
					{ value: "30d", label: "30 days" },
					{ value: "90d", label: "90 days" },
				]}
				value="30d"
				onValueChange={() => {}}
			/>
		</Stack>
	)
}
